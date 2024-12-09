import dayjs from "dayjs";
import csrf from "csrf";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../../prisma/prisma.js";
import env from "../../configs/env.js";
import errorAPI from "../utils/errorAPI.js";

const csrfTokens = new csrf();

const hashToken = async (token) => {
	return crypto.createHash("SHA256").update(token).digest("hex");
};

const generateRandomToken = async (length = 64) => {
	return crypto.randomBytes(length).toString("hex");
};

const generateAccessToken = async (dataUser) => {
	const expiresIn = dayjs()
		.add(env.ACCESS_TOKEN_EXPIRATION_MINUTES, "minute")
		.unix();
	return jwt.sign(dataUser, env.ACCESS_TOKEN_SECRET_PRIVATE, {
		algorithm: "RS256",
		expiresIn,
	});
};

const verifyAccessToken = async (accessToken) => {
	try {
		return jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET_PUBLIC, {
			algorithms: ["RS256"],
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

const generateRefreshToken = async (dataUser) => {
	const expiresIn = dayjs()
		.add(env.REFRESH_TOKEN_EXPIRATION_DAYS, "day")
		.unix();
	return jwt.sign(dataUser, env.REFRESH_TOKEN_SECRET_PRIVATE, {
		algorithm: "RS256",
		expiresIn,
	});
};

const verifyRefreshToken = async (refreshToken) => {
	try {
		return jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET_PUBLIC, {
			algorithms: ["RS256"],
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

const generateCsrfToken = async () => {
	return csrfTokens.create(env.CSRF_SECRET);
};

const verifyCsrfToken = async (token) => {
	return csrfTokens.verify(env.CSRF_SECRET, token);
};

const generateResetPasswordToken = async (email) => {
	const expiresIn = dayjs()
		.add(env.RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES, "minute")
		.format("YYYY-MM-DD HH:mm:ss");
	const token = await generateRandomToken(34);

	const user = await prisma.user.findUnique({
		select: {
			id: true,
			email: true,
		},
		where: {
			email: email,
		},
	});

	const passwordResetToken = await prisma.token.create({
		data: {
			token,
			user_id: user.id,
			expiresIn,
			token_type: "PasswordReset",
		},
	});

	return passwordResetToken.token;
};

const generateVerificationEmailToken = async (user) => {
	const expiresIn = dayjs()
		.add(env.VERIFY_EMAIL_TOKEN_EXPIRATION_MINUTES, "minute")
		.format("YYYY-MM-DD HH:mm:ss");
	const token = await generateRandomToken(34);

	const verifyEmailToken = await prisma.token.create({
		data: {
			token,
			user_id: user.id,
			expiresIn,
			token_type: "VerifyEmail",
		},
	});

	return verifyEmailToken.token;
};

const verifyToken = async (token, type) => {
	const dbToken = await prisma.token.findFirst({
		where: {
			token,
			token_type: type,
		},
	});

	if (!dbToken) {
		throw new errorAPI("Token not found", 404);
	}
	const expiresIn = dayjs(dbToken.expiresIn, "YYYY-MM-DD HH:mm:ss");

	if (expiresIn.isBefore(dayjs())) {
		await prisma.token.delete({
			where: {
				token,
				token_type: type,
			},
		});
		throw new errorAPI("Token expired", 401);
	}
		
	return dbToken;
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
	verifyToken,
};
