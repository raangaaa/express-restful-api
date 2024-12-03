import prisma from "~/prisma/prisma";
import jwt from "jsonwebtoken";
import csrf from "csrf";
import crypto from "crypto";
import httpStatus from "http-status";
import dayjs from "dayjs";
import env from "~/configs/env";
import errorAPI from "@utils/errorAPI";


prisma.$on("query", (e) => {
	logger.log({
		level: "database",
		message: `Query: ${e.query}\nParams: ${e.params}\nDuration: ${e.duration}ms`,
	});
});

const generateRandomToken = async (length = 64) => {
	return crypto.randomBytes(length).toString("hex");
};

const generateAccessToken = async (dataUser) => {
	const expiresIn = dayjs().add(env.JWT_ACCESS_TOKEN_EXPIRATION_MINUTES, "minute").unix();
	return jwt.sign(dataUser, env.JWT_ACCESS_TOKEN_SECRET_PRIVATE, {
		algorithm: "RS256",
		expiresIn,
	});
};

const verifyAccessToken = async (accessToken) => {
	try {
		return jwt.verify(accessToken, env.JWT_ACCESS_TOKEN_SECRET_PUBLIC, {
			algorithms: ["RS256"],
		});
	} catch (err) {
		if (err.name === "TokenExpiredError") {
			throw new errorAPI("Access token expired", httpStatus.UNAUTHORIZED);
		} else if (err.name === "JsonWebTokenError") {
			throw new errorAPI("Access token is invalid", httpStatus.UNAUTHORIZED);
		}
		throw err;
	}
};

const csrfTokens = new csrf();

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

	if (!user) {
		throw new errorAPI(`User with email ${email} not found`, httpStatus.NOT_FOUND);
	}

	const passwordResetToken = await prisma.token.create({
		data: {
			token,
			userId: user.id,
			expiresIn,
			token_type: "PasswordReset",
		},
	});

	return passwordResetToken.token;
};

const generateVerifyEmailToken = async (user) => {
	const expiresIn = dayjs()
		.add(env.VERIFY_EMAIL_TOKEN_EXPIRATION_MINUTES, "minute")
		.format("YYYY-MM-DD HH:mm:ss");
	const token = await generateRandomToken(34);

	const verifyEmailToken = await prisma.token.create({
		data: {
			token,
			userId: user.id,
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
	
	if (!dbToken) throw new errorAPI("Token not found", httpStatus.UNAUTHORIZED);
	
	const expiresIn = dayjs(dbToken.expiresIn, "YYYY-MM-DD HH:mm:ss");

	if(expiresIn.isBefore(dayjs())) throw new errorAPI("Token expired", httpStatus.UNAUTHORIZED);

	return dbToken;
};


export default {
	generateRandomToken,
	generateAccessToken,
	verifyAccessToken,
	generateCsrfToken,
	verifyCsrfToken,
	generateResetPasswordToken,
	generateVerifyEmailToken,
	verifyToken,
};
