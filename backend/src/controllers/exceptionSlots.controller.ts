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

        if (!slot_date || !status || slot === undefined) {
            throw new ApiError(400, "slot_date, status, and slot are required");
        }

        if (slot < 1 || slot > 2) {
            throw new ApiError(400, "Slot must be 1 or 2");
        }

        if (!['updated', 'deleted'].includes(status)) {
            throw new ApiError(400, "Status must be 'updated' or 'deleted'");
        }

        if (status === 'updated') {
            if (!start_time || !end_time) {
                throw new ApiError(400, "start_time and end_time are required for updated status");
            }

            await validateExceptionTaskSlot(slot_date, slot, start_time, end_time, req.body.id);
        }

        try {
            const existingException = await pool.query(
                `SELECT * FROM exception_tasks WHERE slot_date = $1 AND slot = $2`,
                [slot_date, slot]
            );

            let result;
            if (existingException.rows.length > 0) {
                result = await pool.query(
                    `UPDATE exception_tasks 
                     SET common_tasks_id = $1, status = $2, start_time = $3, end_time = $4
                     WHERE slot_date = $5 AND slot = $6 
                     RETURNING *`,
                    [common_tasks_id ?? null, status, start_time ?? null, end_time ?? null, slot_date, slot]
                );

                res.status(200).json({
                    success: true,
                    data: result.rows[0],
                    message: `Exception updated for ${slot_date}, slot ${slot}`
                });
            } else {
                result = await pool.query(
                    `INSERT INTO exception_tasks (common_tasks_id, slot_date, status, start_time, end_time, slot)
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                    [common_tasks_id ?? null, slot_date, status, start_time ?? null, end_time ?? null, slot]
                );

                res.status(201).json({
                    success: true,
                    data: result.rows[0],
                    message: `Exception created for ${slot_date}, slot ${slot}`
                });
            }
        } catch (dbError: any) {
            if (dbError.code === '23505') {
                throw new ApiError(409, `Exception already exists for ${slot_date}, slot ${slot}`);
            }
            throw dbError;
        }

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

        res.status(200).json({
            success: true,
            data: result.rows,
            date: date,
            count: result.rows.length
        });
    } catch (err) {
        next(err as Error);
    }
};

export const deleteExceptionTask = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { date, slot } = req.params;

        if (!date || !slot) {
            throw new ApiError(400, "Date and slot parameters are required");
        }

        const slotNumber = parseInt(slot);
        if (slotNumber < 1 || slotNumber > 2) {
            throw new ApiError(400, "Slot must be 1 or 2");
        }

        const result = await pool.query(
            `DELETE FROM exception_tasks WHERE slot_date = $1 AND slot = $2 RETURNING *`,
            [date, slotNumber]
        );

        if (result.rows.length === 0) {
            throw new ApiError(404, `No exception found for ${date}, slot ${slot}`);
        }

        res.status(200).json({
            success: true,
            message: `Exception removed for ${date}, slot ${slot}`,
            data: result.rows[0]
        });
    } catch (err) {
        next(err as Error);
    }
};

export const getAllExceptionTasks = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

        let query = `SELECT * FROM exception_tasks`;
        const params: any[] = [];

        if (startDate && endDate) {
            query += ` WHERE slot_date BETWEEN $1 AND $2`;
            params.push(startDate, endDate);
        } else if (startDate) {
            query += ` WHERE slot_date >= $1`;
            params.push(startDate);
        } else if (endDate) {
            query += ` WHERE slot_date <= $1`;
            params.push(endDate);
        }

        query += ` ORDER BY slot_date ASC, slot ASC`;

        const result = await pool.query(query, params);

        res.status(200).json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (err) {
        next(err as Error);
    }
};


