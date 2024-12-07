import tokenService from "../services/tokenService.js";
import errorAPI from "../utils/errorAPI.js";
import prisma from "../../prisma/prisma.js";

const verified = async (req, res, next) => {
	try {
		const accessToken =
			req.headers["authorization"] || req.headers["Authorization"];

		if (!accessToken) {
			return next(new errorAPI("Access token missing", 403));
		}

		if (!accessToken.startsWith("Bearer ")) {
			return next(
				new errorAPI("Invalid access token format", 403)
			);
		}

		const token = accessToken.split(" ")[1];

		const payload = await tokenService.verifyAccessToken(token);

		const user = await prisma.user.findFirst({
			where: {
				id: payload.id,
			},
			select: {
				id: true,
				email_verified: true,
			},
		});

		if (!user || !user.email_verified) {
			return next(new errorAPI("Email not verified", 403));
		}

		next();
	} catch (err) {
		if (err instanceof errorAPI) {
			return next(new errorAPI(err.message, err.status));
		}

		return next(err);
	}
};

export default verified;
