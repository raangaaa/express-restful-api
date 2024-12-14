import dayjs from "dayjs";
import cacheService from "../services/cacheService.js";
import tokenService from "../services/tokenService.js";
import env from "../../configs/env.js";
import { logger } from "../utils/logger.js";

/**
 * Retrieves one session of user with given refresh token from the cache
 * @async
 * @param {String} refreshToken - Refresh token with JWT format
 * @returns {Promise<Object>} - One data session
 */
const getOneSession = async (refreshToken) => {
    const payloadRefreshToken = await tokenService.verifyRefreshToken(refreshToken);
    const hashedRefreshToken = tokenService.hashToken(refreshToken);
    const key = `session:${payloadRefreshToken.id}:${hashedRefreshToken}`;

    return await cacheService.get(key);
};

/**
 * Retrieves all sessions associated with the given user ID from the cache.
 * @async
 * @param {String|Number} userId  - User id used for pattern key
 * @returns {Promise<Object[]>} - ALl data session platform from one user
 */
const getAllSesssion = async (userId) => {
    const patternkey = `session:${userId.toString()}:*`;

    return await cacheService.getAll(patternkey);
};

/**
 * Set session user to cache with given user ID, refresh token, user IP address, and user agent
 * @async
 * @param {String|Number} userId - User id used for key cache
 * @param {String} refreshToken - Refresh token with JWT format
 * @param {String} ipAddress - IP address from user
 * @param {String} userAgent - User agent from user request
 * @returns {Promise<void>}
 */
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

/**
 * Deleting one session user platform with given refresh token
 * @async
 * @param {String} refreshToken - Refresh token with JWT format
 * @returns {Promise<void>}
 */
const delSession = async (refreshToken) => {
    const payloadRefreshToken = await tokenService.verifyRefreshToken(refreshToken);
    const hashedRefreshToken = await tokenService.hashToken(refreshToken);

    await cacheService.del(`session:${payloadRefreshToken.id}:${hashedRefreshToken}`);

    logger.info(`User Id: ${userId} deleting session for ${userAgent} and IP ${ipAddress}`);
};

export default { getOneSession, getAllSesssion, setSession, delSession };
