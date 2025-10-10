import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.utils.js";

export const errorHandler = (
    err: Error | ApiError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error("Error:", err);

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
        });
    }

    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
};
