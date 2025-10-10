import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.utils.js";

function parseTimeToSeconds(time: string): number | null {
    //  HH:MM or HH:MM:SS dono...
    const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(time);
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    const seconds = match[3] ? Number(match[3]) : 0;
    if (hours > 23 || minutes > 59 || seconds > 59) return null;
    return hours * 3600 + minutes * 60 + seconds;
}

export const validateCreateCommonTask = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { weekday, start_time, end_time, slot } = req.body ?? {};

    if (weekday === undefined || start_time === undefined || end_time === undefined || slot === undefined) {
        return next(new ApiError(400, "Missing required fields: weekday, start_time, end_time, slot"));
    }

    if (typeof weekday !== "number" || !Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
        return next(new ApiError(400, "weekday must be an integer between 0 and 6"));
    }

    if (typeof slot !== "number" || !Number.isInteger(slot) || slot < 1 || slot > 2) {
        return next(new ApiError(400, "slot must be an integer between 1 and 2"));
    }

    if (typeof start_time !== "string" || typeof end_time !== "string") {
        return next(new ApiError(400, "start_time and end_time must be strings in HH:MM format"));
    }

    const startSeconds = parseTimeToSeconds(start_time);
    const endSeconds = parseTimeToSeconds(end_time);
    if (startSeconds === null || endSeconds === null) {
        return next(new ApiError(400, "Invalid time format. Use HH:MM or HH:MM:SS"));
    }
    if (endSeconds <= startSeconds) {
        return next(new ApiError(400, "end_time must be greater than start_time"));
    }

    next();
};

export const validateCreateExceptionTask = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { common_tasks_id, slot_date, status, start_time, end_time, slot } = req.body ?? {};

    if (!slot_date || !status) {
        return next(new ApiError(400, "slot_date and status are required"));
    }

    if (status !== 'updated' && status !== 'deleted') {
        return next(new ApiError(400, "status must be 'updated' or 'deleted'"));
    }

    // apna basic date format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(slot_date)) {
        return next(new ApiError(400, "slot_date must be YYYY-MM-DD"));
    }

    if (status === 'deleted') {
        // slotwise selete ..slot number ke hisaab se..
        if (slot === undefined || typeof slot !== "number" || !Number.isInteger(slot) || slot < 1 || slot > 2) {
            return next(new ApiError(400, "slot must be an integer between 1 and 2 for deleted status"));
        }
        return next();
    }

    if (start_time === undefined || end_time === undefined || slot === undefined) {
        return next(new ApiError(400, "start_time, end_time, and slot are required for updated status"));
    }

    if (typeof slot !== "number" || !Number.isInteger(slot) || slot < 1 || slot > 2) {
        return next(new ApiError(400, "slot must be an integer between 1 and 2"));
    }

    if (typeof start_time !== "string" || typeof end_time !== "string") {
        return next(new ApiError(400, "start_time and end_time must be strings in HH:MM format"));
    }

    const startSeconds = parseTimeToSeconds(start_time);
    const endSeconds = parseTimeToSeconds(end_time);
    if (startSeconds === null || endSeconds === null) {
        return next(new ApiError(400, "Invalid time format. Use HH:MM or HH:MM:SS"));
    }
    if (endSeconds <= startSeconds) {
        return next(new ApiError(400, "end_time must be greater than start_time"));
    }

    next();
};

