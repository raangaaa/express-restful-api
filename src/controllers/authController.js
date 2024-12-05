import prisma from "~/prisma/prisma";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import sanitizeAndValidate from "@utils/validate";
import authValidation from "@validations/authValidation";
import { logger } from "~/configs/logging";
import tokenService from "@services/tokenService";
import sessionService from "@services/sessionService";
import status from "statuses";

const signup = async (req, res) => {
	try {
		const { error, value } = sanitizeAndValidate(authValidation.signup, req);

		if (error) {
			return res.status(status("BAD_REQUEST")).json({
				success: false,
				status: status("BAD_REQUEST"),
				message: "Validation error",
				errors: error.details.map((detail) => detail.message),
			});
		}

		const hashedPassword = await bcrypt.hash(value.body.password, 12);

		const user = await prisma.user.create({
			data: {
				...value.body,
				Profile: {
					create: {
						name: value.body.name,
					},
				},
				password: hashedPassword,
			},
		});

		logger.info(`${user.name} has been registered to the system`);

		return res.status(status("CREATED")).json({
			success: true,
			status: status("CREATED"),
			data: {
				id: user.id,
				name: user.name,
				username: user.username,
				email: user.email,
			},
		});
	} catch (err) {
		logger.error("Error during signup:", err);

		if (err instanceof errorAPI) {
			return res.status(err.status).json({
				success: false,
				status: err.status,
				errors: [err.message],
			});
		}

		return res.status(status("INTERNAL_SERVER_ERROR")).json({
			success: false,
			status: status("INTERNAL_SERVER_ERROR"),
			error: "An error occurred during signup.",
		});
	}
};

const signin = async (req, res) => {
	try {
		const { error, value } = sanitizeAndValidate(authValidation.signin, req);

		if (error) {
			return res.status(status("BAD_REQUEST")).json({
				success: false,
				status: status("BAD_REQUEST"),
				message: "Validation error",
				errors: error.details.map((detail) => detail.message),
			});
		}

		const user = await prisma.user.findFirst({
			where: {
				OR: [{ email: value.body.email }, { username: value.body.username }],
			},
		});

		if (!user) {
			return res.status(status("UNAUTHORIZED")).json({
				success: false,
				status: status("UNAUTHORIZED"),
				message: "Sign in failed",
				errors: ["Sign in failed"],
			});
		}

		const isPasswordValid = await bcrypt.compare(
			value.body.password,
			user.password
		);

		if (!isPasswordValid) {
			return res.status(status("UNAUTHORIZED")).json({
				success: false,
				status: status("UNAUTHORIZED"),
				message: "Sign in failed",
				errors: ["Sign in failed"],
			});
		}

		const userData = {
			id: user.id,
			role: user.role,
		};

		const accessToken = await tokenService.generateAccessToken(userData);
		const refreshToken = await tokenService.generateRefreshToken(userData);
		const csrfToken = await tokenService.generateCsrfToken();

		await sessionService.setSession(
			user.id,
			refreshToken,
			req.ip,
			req.headers["user-agent"]
		);

		logger.info(`${user.name} has been signin to the system`);

		res.cookie("refresh_token", refreshToken, {
			httpOnly: true,
			secure: true,
			signed: true,
			sameSite: "Strict",
		});

		return res.status(status("OK")).json({
			success: true,
			status: status("OK"),
			data: {
				user: {
					id: user.id,
					name: user.name,
					username: user.username,
					email: user.email,
				},
				token: {
					access_token: accessToken,
					csrf_token: csrfToken,
				},
			},
		});
	} catch (err) {
		logger.error("Error during signin:", err);

		if (err instanceof errorAPI) {
			return res.status(err.status).json({
				success: false,
				status: err.status,
				message: err.message,
				error: [err.message],
			});
		}

		logger.error("Error during signin:", err);
		return res.status(status("INTERNAL_SERVER_ERROR")).json({
			success: false,
			status: status("INTERNAL_SERVER_ERROR"),
			message: "An error occurred during signup.",
			errors: ["An error occurred during signup."],
		});
	}
};

export default { signup, signin };
