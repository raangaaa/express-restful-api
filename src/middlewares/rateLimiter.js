import rateLimit from "express-rate-limit";
import APIError from "@utils/apiError";
import status from "statuses";

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
