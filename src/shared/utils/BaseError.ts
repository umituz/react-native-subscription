export abstract class BaseError extends Error {
    public readonly code: string;
    public readonly cause?: Error;

    constructor(message: string, code: string, cause?: Error) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.cause = cause;
        Object.setPrototypeOf(this, new.target.prototype);
    }

    toJSON() {
        return {
            name: this.name,
            code: this.code,
            message: this.message,
            cause: this.cause?.message,
        };
    }
}
