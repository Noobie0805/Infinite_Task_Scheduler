import type { Request, Response, NextFunction } from "express";
import { pool } from "../db/index.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { validateCommonTaskSlot, getEffectiveSlotsForDate } from "../utils/slotManagement.utils.js";


export const createCommonTask = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { weekday, start_time, end_time, slot } = req.body;

        if (weekday === undefined || !start_time || !end_time || slot === undefined) {
            throw new ApiError(400, "Missing required fields: weekday, start_time, end_time, slot");
        }
        if (slot < 1 || slot > 2) {
            throw new ApiError(400, "Slot must be 1 or 2");
        }
        await validateCommonTaskSlot(weekday, slot, start_time, end_time);

        const result = await pool.query(
            `INSERT INTO common_tasks (weekday, start_time, end_time, slot)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [weekday, start_time, end_time, slot]
        );

        res.status(201).json({
            success: true,
            data: result.rows[0],
        });
    } catch (err) {
        next(err);
    }
};

export const getCommonTasks = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { weekday } = req.query as { weekday?: string };

        let result;
        if (weekday !== undefined) {
            const day = Number(weekday);
            if (!Number.isInteger(day) || day < 0 || day > 6) {
                throw new ApiError(400, "weekday must be an integer between 0 and 6");
            }
            result = await pool.query(
                `SELECT * FROM common_tasks WHERE weekday = $1 ORDER BY slot ASC`,
                [day]
            );
        } else {
            result = await pool.query(
                `SELECT * FROM common_tasks ORDER BY weekday ASC, slot ASC`
            );
        }

        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        next(err as Error);
    }
};

export const getEffectiveSlots = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { date } = req.query as { date?: string };
        if (!date) {
            throw new ApiError(400, "Missing required query param: date");
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw new ApiError(400, "date must be YYYY-MM-DD");
        }

        const effectiveSlots = await getEffectiveSlotsForDate(date);

        res.status(200).json({ 
            success: true, 
            data: effectiveSlots,
            message: `Effective slots for ${date}`
        });
    } catch (err) {
        next(err as Error);
    }
};
