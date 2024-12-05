import tokenService from "@services/tokenService";
import errorAPI from "@utils/errorAPI";
import status from "statuses";

const auth = async (req, res, next) => {
	try {
		const accessToken =
			req.headers["authorization"] || req.headers["Authorization"];

		if (!accessToken) {
			return next(new errorAPI("Access token missing", status("UNAUTHORIZED")));
		}

		if (!accessToken.startsWith("Bearer ")) {
			return next(
				new errorAPI("Invalid access token format", status("UNAUTHORIZED"))
			);
		}

		const token = accessToken.split(" ")[1];

		const payloadAccessToken = await tokenService.verifyAccessToken(token);
		const payloadRefreshToken = await tokenService.verifyRefreshToken(
			req.signedCookies["refresh_token"]
		);

		if (payloadAccessToken.id !== payloadRefreshToken.id) {
			return next(
				new errorAPI(
					"Session or Access token is invalid",
					status("UNAUTHORIZED")
				)
			);
		}

		req.user = payloadAccessToken

		next();
	} catch (err) {
		if (err instanceof errorAPI) {
			return next(new errorAPI(err.message, err.status));
		}

		return next(err);
	}
};

export default auth;
