export class AppError extends Error {
    public statusCode: number;

    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.statusCode = statusCode;
        
        this.name = this.constructor.name;
        
        Error.captureStackTrace(this, this.constructor);
    }
}