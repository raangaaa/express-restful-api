import httpStatus from "http-status";
import env from "~/configs/env";
import { logger } from "~/configs/logging";
import errorAPI from "@utils/errorAPI";

export const notFound = (req, res, next) => {
	return next(
		new errorAPI(httpStatus[httpStatus.NOT_FOUND], httpStatus.NOT_FOUND)
	);
};

export const handler = (err, req, res, next) => {
	let { status, message } = err;
	if (env.NODE_ENV === "production" && !err.isOperational) {
		status = httpStatus.INTERNAL_SERVER_ERROR;
		message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
	}
	logger.error(err.stack);
	return res.status(status).json({
		status: status,
		errors: message,
		...(env.NODE_ENV === "development" && { stack: err.stack }),
	});
};

export default { notFound, handler };
