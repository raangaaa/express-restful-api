import cacheService from "@services/cacheService";
import tokenService from "@services/tokenService";
import env from "~/configs/env";
import dayjs from "dayjs";
import { logger } from "~/configs/logging";

const getAllSesssion = async (userId) => {
	const patternkey = `session:${userId}:*`;

	return await cacheService.getAll(patternkey);
};

const setSession = async (userId, refreshToken, ipAddress, userAgent) => {
	const sessionData = {
		user_id: userId,
		refresh_token: refreshToken,
		ip_address: ipAddress,
		user_agent: userAgent,
		login_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
	};

	const hashedRefreshToken = await tokenService.hashToken(refreshToken);

	await cacheService.set(
		`session:${userId}:${hashedRefreshToken}`,
		sessionData,
		env.REFRESH_TOKEN_EXPIRATION_DAYS * 86400
	);

	logger.info(
		`User Id: ${userId} creating session for ${userAgent} and IP ${ipAddress}`
	);
};

const delSession = async (refreshToken) => {
	const payload = await tokenService.verifyRefreshToken(refreshToken);
	const hashedRefreshToken = await tokenService.hashToken(refreshToken);

	await cacheService.del(`session:${payload.id}:${hashedRefreshToken}`);

	logger.info(
		`User Id: ${userId} deleting session for ${userAgent} and IP ${ipAddress}`
	);
};

export default { getAllSesssion, setSession, delSession };
