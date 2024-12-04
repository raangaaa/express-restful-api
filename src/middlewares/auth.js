import httStatus from "http-status";
import tokenService from "@services/tokenService";
import errorAPI from "@utils/errorAPI";

const auth = async (req, res, next) => {
	try {
		const accessToken =
			req.headers["authorization"] || req.headers["Authorization"];

		if (!accessToken) {
			return next(new errorAPI("Access token missing", httStatus.UNAUTHORIZED));
		}

		if (!accessToken.startsWith("Bearer ")) {
			return next(
				new errorAPI("Invalid access token format", httStatus.UNAUTHORIZED)
			);
		}

		const token = accessToken.split(" ")[1];

		await tokenService.verifyAccessToken(token);

		next();
	} catch (err) {
		if (err instanceof errorAPI) {
			return next(new errorAPI(err.message, err.status));
		}

		return next(
			new errorAPI(
				"An unexpected error occurred",
				httStatus.INTERNAL_SERVER_ERROR
			)
		);
	}
};

export default auth;
