import env from "../../configs/env.js";
import { logger } from "../utils/logger.js";
import errorAPI from "../utils/errorAPIjs";

// Handle not provided path request
export const notFound = (req, res, next) => {
    return next(new errorAPI("Resources not found", 404));
};

// Error handler middleware
// Handle function middleware, sanitizeAndValidate, control
export const handler = (err, req, res, next) => {
    logger.error(err.stack);

    if (err instanceof errorAPI) {
        return res.status(err.status).json({
            success: false,
            statusCode: err.status,
            message: err.message,
            errors: err.errors ? err.errors : [err.message],
            ...(env.NODE_ENV === "development" && { stack: err.stack })
        });
    }

    return res.status(500).json({
        success: false,
        statusCode: 500,
        message: "INTERNAL_SERVER_ERROR",
        errors: ["INTERNAL_SERVER_ERROR"],
        ...(env.NODE_ENV === "development" && { stack: err.stack })
    });
};

export default { notFound, handler };
