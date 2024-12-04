import httStatus from "http-status";
import tokenService from "@services/tokenService";
import cacheService from "@services/cacheService";
import errorAPI from "@utils/errorAPI";
import prisma from "~/prisma/prisma";

const verified = async (req, res, next) => {
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

		const payload = await tokenService.verifyAccessToken(token);

		const session = await cacheService.get(`session-${payload.id}-1`);

		if (!session) {
			return next(new errorAPI("Session not found", httStatus.UNAUTHORIZED));
		}

		const user = await prisma.user.findFirst({
			where: {
				id: session.userId,
			},
			select: {
				id: true,
				email: true,
				email_verified: true,
			},
		});

		if (!user || !user.email_verified) {
			return next(new errorAPI("Email not verified", httStatus.UNAUTHORIZED));
		}

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

export default verified;
