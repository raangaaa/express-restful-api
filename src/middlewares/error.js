import env from "~/configs/env";
import { logger } from "~/configs/logging";
import errorAPI from "@utils/errorAPI";
import statuses from "statuses";

export const notFound = (req, res, next) => {
	return next(new errorAPI("Resources not found", statuses("NOT_FOUND")));
};

export const handler = (err, req, res, next) => {
	let { status, message } = err;
	logger.error(err.stack);

	if (err instanceof errorAPI) {
		return res.status(status).json({
			success: false,
			status: status,
			message: message,
			errors: [message],
			...(env.NODE_ENV === "development" && { stack: err.stack }),
		});
	}

	return res.status(statuses("INTERNAL_SERVER_ERROR")).json({
		success: false,
		status: statuses("INTERNAL_SERVER_ERROR"),
		message: "INTERNAL_SERVER_ERROR",
		errors: ["INTERNAL_SERVER_ERROR"],
		...(env.NODE_ENV === "development" && { stack: err.stack }),
	});
};

export default { notFound, handler };
