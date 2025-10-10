class ApiError extends Error {
    statusCode: number;
    errors: any[];

    constructor(statusCode: number, message = "Something went wrong", errors: any[] = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;

        Error.captureStackTrace(this, this.constructor);
    }
}

export { ApiError };
