import { pool } from "../db/index.js";
import { ApiError } from "./ApiError.utils.js";

export interface SlotConflict {
    slot: number;
    start_time: string;
    end_time: string;
}

export interface TimeSlot {
    start_time: string;
    end_time: string;
    slot: number;
}

/**
 * Check if two time ranges overlap
 */
export function timeRangesOverlap(
    start1: string, 
    end1: string, 
    start2: string, 
    end2: string
): boolean {
    const start1Seconds = timeToSeconds(start1);
    const end1Seconds = timeToSeconds(end1);
    const start2Seconds = timeToSeconds(start2);
    const end2Seconds = timeToSeconds(end2);

    return !(end1Seconds <= start2Seconds || end2Seconds <= start1Seconds);
}

/**
 * Convert time string (HH:MM) to seconds since midnight
 */
export function timeToSeconds(time: string): number {
    const parts = time.split(':').map(Number);
    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;
    return hours * 3600 + minutes * 60;
}

/**
 * Convert seconds since midnight to time string (HH:MM)
 */
export function secondsToTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Get available slots for a specific weekday
 */
export async function getAvailableSlotsForWeekday(weekday: number): Promise<number[]> {
    const result = await pool.query(
        `SELECT slot FROM common_tasks WHERE weekday = $1 ORDER BY slot ASC`,
        [weekday]
    );
    
    const usedSlots = result.rows.map(row => row.slot);
    return [1, 2].filter(slot => !usedSlots.includes(slot));
}

/**
 * Check for time conflicts with existing common tasks for a weekday
 */
export async function checkCommonTaskConflicts(
    weekday: number,
    startTime: string,
    endTime: string,
    excludeSlot?: number
): Promise<SlotConflict[]> {
    let query = `
        SELECT slot, start_time, end_time FROM common_tasks 
        WHERE weekday = $1 
        AND (
            (start_time <= $2 AND end_time > $2) OR
            (start_time < $3 AND end_time >= $3) OR
            (start_time >= $2 AND end_time <= $3)
        )
    `;
    
    const params: any[] = [weekday, startTime, endTime];
    
    if (excludeSlot !== undefined) {
        query += ` AND slot != $4`;
        params.push(excludeSlot);
    }
    
    const result = await pool.query(query, params);
    return result.rows;
}

/**
 * Check for time conflicts with existing exception tasks for a specific date
 */
export async function checkExceptionTaskConflicts(
    slotDate: string,
    startTime: string,
    endTime: string,
    excludeSlot?: number,
    excludeId?: number
): Promise<SlotConflict[]> {
    let query = `
        SELECT slot, start_time, end_time FROM exception_tasks 
        WHERE slot_date = $1 AND status = 'updated'
        AND (
            (start_time <= $2 AND end_time > $2) OR
            (start_time < $3 AND end_time >= $3) OR
            (start_time >= $2 AND end_time <= $3)
        )
    `;
    
    const params: any[] = [slotDate, startTime, endTime];
    
    if (excludeSlot !== undefined) {
        query += ` AND slot != $4`;
        params.push(excludeSlot);
    }
    
    if (excludeId !== undefined) {
        query += ` AND id != $${params.length + 1}`;
        params.push(excludeId);
    }
    
    const result = await pool.query(query, params);
    return result.rows;
}

/**
 * Get the next available slot number for a weekday
 */
export async function getNextAvailableSlot(weekday: number): Promise<number | null> {
    const availableSlots = await getAvailableSlotsForWeekday(weekday);
    return availableSlots.length > 0 ? (availableSlots[0] ?? null) : null;
}

/**
 * Validate slot assignment for common tasks
 */
export async function validateCommonTaskSlot(
    weekday: number,
    slot: number,
    startTime: string,
    endTime: string
): Promise<void> {
    // Check if slot is already taken
    const existingSlot = await pool.query(
        `SELECT id FROM common_tasks WHERE weekday = $1 AND slot = $2`,
        [weekday, slot]
    );

    if (existingSlot.rows.length > 0) {
        throw new ApiError(400, `Slot ${slot} already exists for weekday ${weekday}`);
    }

    // Check for time conflicts
    const conflicts = await checkCommonTaskConflicts(weekday, startTime, endTime);
    if (conflicts.length > 0) {
        const conflictingSlots = conflicts.map(c => c.slot).join(', ');
        throw new ApiError(400, `Time conflict with existing slot(s): ${conflictingSlots}`);
    }
}

/**
 * Validate slot assignment for exception tasks
 */
export async function validateExceptionTaskSlot(
    slotDate: string,
    slot: number,
    startTime: string,
    endTime: string,
    excludeId?: number
): Promise<void> {
    // Check if slot already has an exception for this date
    const existingException = await pool.query(
        `SELECT id FROM exception_tasks 
         WHERE slot_date = $1 AND slot = $2 AND status = 'updated'
         ${excludeId ? 'AND id != $3' : ''}`,
        excludeId ? [slotDate, slot, excludeId] : [slotDate, slot]
    );

    if (existingException.rows.length > 0) {
        throw new ApiError(400, `Slot ${slot} already has an exception for date ${slotDate}`);
    }

    // Check for time conflicts with other exceptions
    const conflicts = await checkExceptionTaskConflicts(slotDate, startTime, endTime, slot, excludeId);
    if (conflicts.length > 0) {
        const conflictingSlots = conflicts.map(c => c.slot).join(', ');
        throw new ApiError(400, `Time conflict with existing exception slot(s): ${conflictingSlots}`);
    }
}

/**
 * Get all slots for a specific weekday with their times
 */
export async function getWeekdaySlots(weekday: number): Promise<TimeSlot[]> {
    const result = await pool.query(
        `SELECT start_time, end_time, slot FROM common_tasks 
         WHERE weekday = $1 
         ORDER BY slot ASC`,
        [weekday]
    );
    
    return result.rows;
}

/**
 * Get all exception slots for a specific date
 */
export async function getDateExceptionSlots(slotDate: string): Promise<TimeSlot[]> {
    const result = await pool.query(
        `SELECT start_time, end_time, slot FROM exception_tasks 
         WHERE slot_date = $1 AND status = 'updated'
         ORDER BY slot ASC`,
        [slotDate]
    );
    
    return result.rows;
}

/**
 * Get effective slots for a specific date (common tasks + exceptions)
 */
export async function getEffectiveSlotsForDate(slotDate: string): Promise<TimeSlot[]> {
    // Get the weekday for the date
    const dateObj = new Date(slotDate);
    const weekday = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Get common tasks for this weekday
    const commonSlots = await getWeekdaySlots(weekday);
    
    // Get exceptions for this specific date
    const exceptionSlots = await getDateExceptionSlots(slotDate);
    
    // Create a map of slot exceptions
    const exceptionMap = new Map<number, TimeSlot>();
    exceptionSlots.forEach(slot => {
        exceptionMap.set(slot.slot, slot);
    });
    
    // Build effective slots (common tasks overridden by exceptions)
    const effectiveSlots: TimeSlot[] = [];
    
    commonSlots.forEach(commonSlot => {
        const exceptionSlot = exceptionMap.get(commonSlot.slot);
        if (exceptionSlot) {
            // Use exception slot
            effectiveSlots.push(exceptionSlot);
        } else {
            // Use common slot
            effectiveSlots.push(commonSlot);
        }
    });
    
    // Add any new exception slots that don't override common slots
    exceptionSlots.forEach(exceptionSlot => {
        if (!commonSlots.some(commonSlot => commonSlot.slot === exceptionSlot.slot)) {
            effectiveSlots.push(exceptionSlot);
        }
    });
    
    return effectiveSlots.sort((a, b) => a.slot - b.slot);
}
