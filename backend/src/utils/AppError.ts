export class AppError extends Error {
    public statusCode: number;
    public code: string;
    public details?: any;

    constructor(message: string, statusCode: number = 400, code: string = 'BAD_REQUEST', details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        
        this.name = this.constructor.name;
        
        Error.captureStackTrace(this, this.constructor);
    }
}