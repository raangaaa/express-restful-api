import dayjs from "dayjs";
import cacheService from "../services/cacheService.js";
import tokenService from "../services/tokenService.js";
import env from "../../configs/env.js";
import { logger } from "../utils/logger.js";

const getOneSession = async (refreshToken) => {
    const payloadRefreshToken = await tokenService.verifyRefreshToken(refreshToken);
    const hashedRefreshToken = await tokenService.hashToken(refreshToken);
    const key = `session:${payloadRefreshToken.id}:${hashedRefreshToken}`;

    return await cacheService.get(key);
};

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
        login_time: dayjs().format("YYYY-MM-DD HH:mm:ss")
    };

    const hashedRefreshToken = await tokenService.hashToken(refreshToken);

    await cacheService.set(`session:${userId}:${hashedRefreshToken}`, sessionData, env.REFRESH_TOKEN_EXPIRATION_DAYS * 86400);

    logger.info(`User Id: ${userId} creating session for ${userAgent} and IP ${ipAddress}`);
};

const delSession = async (refreshToken) => {
    const payloadRefreshToken = await tokenService.verifyRefreshToken(refreshToken);
    const hashedRefreshToken = await tokenService.hashToken(refreshToken);

    await cacheService.del(`session:${payloadRefreshToken.id}:${hashedRefreshToken}`);

    logger.info(`User Id: ${userId} deleting session for ${userAgent} and IP ${ipAddress}`);
};

export default { getOneSession, getAllSesssion, setSession, delSession };
