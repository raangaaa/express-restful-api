import rateLimit from "express-rate-limit";
import status from "statuses";
import APIError from "../utils/apiError.js";

const rateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	handler: (req, res, next) => {
		next(
			new APIError(
				"Too many requests, please try again later.",
				status("TOO_MANY_REQUESTS")
			)
		);
	},
});

export default rateLimiter;
