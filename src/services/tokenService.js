import dayjs from "dayjs";
import csrf from "csrf";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../../prisma/prisma.js";
import env from "../../configs/env.js";
import errorAPI from "../utils/errorAPI.js";

const csrfTokens = new csrf();

/**
 * Create hash of data with SHA256 algorithm
 * @param {String} data - Data to be hashed
 * @returns {String} - Hashed data
 */
const hashToken = (data) => {
    return crypto.createHash("SHA256").update(data).digest("hex");
};

/**
 * Create random token, default length is 64
 * @param {Number} length - Length of token
 * @returns {String} - Random token
 */
const generateRandomToken = (length = 64) => {
    return crypto.randomBytes(length).toString("hex");
};

/**
 * Create JWT Access token with RS256 algorithm
 * @async
 * @param {Object} userData - User data will be encrypted as payload 
 * @returns {Promise<String>} - Access token with format JWT
 */
const generateAccessToken = async (userData) => {
    const expiresIn = dayjs().add(env.ACCESS_TOKEN_EXPIRATION_MINUTES, "minute").unix();
    return jwt.sign(userData, env.ACCESS_TOKEN_SECRET_PRIVATE, {
        algorithm: "RS256",
        expiresIn
    });
};

/**
 * Verifiying Access token
 * @async
 * @param {String} accessToken - Access token will be verify
 * @returns {Promise<jwt.JwtPayload>} - Payload of user data
 */
const verifyAccessToken = async (accessToken) => {
    try {
        return jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET_PUBLIC, {
            algorithms: ["RS256"]
        });
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            throw new errorAPI("Access expired", 401);
        } else if (err.name === "JsonWebTokenError") {
            throw new errorAPI("Access is invalid", 401);
        }

        throw err;
    }
};

/**
 * Create JWT Refresh token with RS256 algorithm
 * @async
 * @param {Object} userData - User data will be encrypted as payload 
 * @returns {Promise<String>} - Refresh token with format JWT
 */
const generateRefreshToken = async (userData) => {
    const expiresIn = dayjs().add(env.REFRESH_TOKEN_EXPIRATION_DAYS, "day").unix();
    return jwt.sign(userData, env.REFRESH_TOKEN_SECRET_PRIVATE, {
        algorithm: "RS256",
        expiresIn
    });
};

/**
 * Verifiying Refresh token
 * @async
 * @param {String} refreshToken - Refresh token will be verify
 * @returns {Promise<jwt.JwtPayload>} - Payload of user data
 */
const verifyRefreshToken = async (refreshToken) => {
    try {
        return jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET_PUBLIC, {
            algorithms: ["RS256"]
        });
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            throw new errorAPI("Session expired", 401);
        } else if (err.name === "JsonWebTokenError") {
            throw new errorAPI("Session is invalid", 401);
        }

        throw err;
    }
};

/**
 * Create CSRF token
 * @returns {String} - CSRF token
 */
const generateCsrfToken = () => {
    return csrfTokens.create(env.CSRF_SECRET);
};

/**
 * Verifiying CSRF token 
 * @param {String} token - CSRF token will be verify
 * @returns {Boolean}
 */
const verifyCsrfToken = (token) => {
    return csrfTokens.verify(env.CSRF_SECRET, token);
};

/**
 * Create reset passowrd token and save token to database
 * @async
 * @param {String} email - Registered user email 
 * @returns {Promise<String>} - Random token
 */
const generateResetPasswordToken = async (email) => {
    const expiresIn = dayjs().add(env.RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES, "minute").format("YYYY-MM-DD HH:mm:ss");
    const token = generateRandomToken(34);

    const user = await prisma.user.findUnique({
        select: {
            id: true,
            email: true
        },
        where: {
            email: email
        }
    });

    const passwordResetToken = await prisma.token.create({
        data: {
            token,
            user_id: user.id,
            expiresIn,
            token_type: "ResetPassword"
        }
    });

    return passwordResetToken.token;
};

/**
 * Create verification email token and save token to database
 * @async
 * @param {String} email - User data
 * @returns {Promise<String>} - Random token
 */
const generateVerificationEmailToken = async (user) => {
    const expiresIn = dayjs().add(env.VERIFY_EMAIL_TOKEN_EXPIRATION_MINUTES, "minute").format("YYYY-MM-DD HH:mm:ss");
    const token = generateRandomToken(34);

    const verifyEmailToken = await prisma.token.create({
        data: {
            token,
            user_id: user.id,
            expiresIn,
            token_type: "VerificationEmail"
        }
    });

    return verifyEmailToken.token;
};

/**
 * Verify token are expired or not and Retreive data token from database
 * @async
 * @param {String} token - Reset password token or Verification email token
 * @param {String} type - ResetPassword or VerificationEmail
 * @returns {Boolean}
 */
const verifyToken = async (token, type) => {
    const dbToken = await prisma.token.findFirst({
        where: {
            token,
            token_type: type
        }
    });

    if (!dbToken) {
        throw new errorAPI("Token not found", 404);
    }
    const expiresIn = dayjs(dbToken.expiresIn, "YYYY-MM-DD HH:mm:ss");

    if (expiresIn.isBefore(dayjs())) {
        await prisma.token.delete({
            where: {
                token,
                token_type: type
            }
        });
        throw new errorAPI("Token expired", 401);
    }

    return dbToken ? true : false;
};

export default {
    hashToken,
    generateRandomToken,
    generateAccessToken,
    verifyAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    generateCsrfToken,
    verifyCsrfToken,
    generateResetPasswordToken,
    generateVerificationEmailToken,
    verifyToken
};
