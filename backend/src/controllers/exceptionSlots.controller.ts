import type { Request, Response, NextFunction } from "express";
import { pool } from "../db/index.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { validateExceptionTaskSlot } from "../utils/slotManagement.utils.js";

export const createExceptionTask = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { common_tasks_id, slot_date, status, start_time, end_time, slot } = req.body;

        // Validate slot range
        if (slot !== undefined && (slot < 1 || slot > 2)) {
            throw new ApiError(400, "Slot must be 1 or 2");
        }

        // If status is 'updated', validate required fields and slot assignment
        if (status === 'updated') {
            if (!start_time || !end_time || slot === undefined) {
                throw new ApiError(400, "start_time, end_time, and slot are required for updated status");
            }

            // Validate slot assignment
            await validateExceptionTaskSlot(slot_date, slot, start_time, end_time, req.body.id);
        }

        const result = await pool.query(
            `INSERT INTO exception_tasks (common_tasks_id, slot_date, status, start_time, end_time, slot)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [common_tasks_id ?? null, slot_date, status, start_time ?? null, end_time ?? null, slot ?? null]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
        next(err as Error);
    }
};

export const getExceptionTasksByDate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { date } = req.query as { date?: string };
        if (!date) {
            throw new ApiError(400, "Missing required query param: date");
        }

        const result = await pool.query(
            `SELECT * FROM exception_tasks WHERE slot_date = $1 ORDER BY slot ASC`,
            [date]
        );

        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        next(err as Error);
    }
};


