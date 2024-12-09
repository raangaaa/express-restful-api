import rateLimit from "express-rate-limit";
import APIError from "../utils/apiError.js";

const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    handler: (req, res, next) => {
        next(new APIError("Too many requests, please try again later.", 429));
    }
});

export default rateLimiter;
