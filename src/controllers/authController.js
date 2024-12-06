import status from "statuses";
import dayjs from "dayjs";
import bcrypt from "bcrypt";
import passport from "passport";
import prisma from "../../prisma/prisma.js";
import sanitizeAndValidate from "../utils/validate.js";
import authValidation from "../validations/authValidation.js";
import { logger } from "../../configs/logging.js";
import tokenService from "../services/tokenService.js";
import sessionService from "../services/sessionService.js";
import publisher from "../events/eventEmitter.js";
import env from "../../configs/env.js";

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

		publisher.emit("userRegistered", user);

		logger.info(`${user.name} has been registered to the system`);

		return res.status(status("CREATED")).json({
			success: true,
			status: status("CREATED"),
			message: "Signup succesfull",
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
				message: err.message,
				errors: [err.message],
			});
		}

		return res.status(status("INTERNAL_SERVER_ERROR")).json({
			success: false,
			status: status("INTERNAL_SERVER_ERROR"),
			message: "An error occurred during signup",
			errors: ["An error occurred during signup"],
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

		logger.info(`${user.name} has been signin`);

		res.cookie("refresh_token", refreshToken, {
			httpOnly: true,
			secure: true,
			signed: true,
			sameSite: "Strict",
		});

		return res.status(status("OK")).json({
			success: true,
			status: status("OK"),
			message: "Signin successfull",
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
			message: "An error occurred during signin.",
			errors: ["An error occurred during signin."],
		});
	}
};

const signout = async (req, res) => {
	try {
		const refreshToken = req.signedCookies["refresh_token"];

		await sessionService.delSession(refreshToken);

		const csrfToken = await tokenService.generateCsrfToken();

		return res.status(status("OK")).json({
			success: true,
			status: status("OK"),
			message: "Signout successfull",
			data: {
				csrf_token: csrfToken,
			},
		});
	} catch (err) {
		logger.error("Error during signout:", err);

		if (err instanceof errorAPI) {
			return res.status(err.status).json({
				success: false,
				status: err.status,
				message: err.message,
				errors: [err.message],
			});
		}

		return res.status(status("INTERNAL_SERVER_ERROR")).json({
			success: false,
			status: status("INTERNAL_SERVER_ERROR"),
			message: "An error occurred during signout",
			errors: ["An error occurred during signout"],
		});
	}
};

const refresh = async (req, res) => {
	try {
		const refreshToken = req.signedCookies["refresh_token"];

		const currentSession = await sessionService.getOneSession(refreshToken);

		if (!currentSession) {
			return res.status(status("UNAUTHORIZED")).json({
				success: false,
				status: status("UNAUTHORIZED"),
				message: "Session expired",
				errors: ["Session expired"],
			});
		}

		const payloadRefreshToken = await tokenService.verifyRefreshToken(
			refreshToken
		);

		const accessToken = await tokenService.generateAccessToken(
			payloadRefreshToken
		);
		const csrfToken = await tokenService.generateCsrfToken();

		return res.status(status("OK")).json({
			success: true,
			status: status("OK"),
			message: "Access extended",
			data: {
				token: {
					access_token: accessToken,
					csrf_token: csrfToken,
				},
			},
		});
	} catch (err) {
		logger.error("Error during refresh:", err);

		if (err instanceof errorAPI) {
			return res.status(err.status).json({
				success: false,
				status: err.status,
				message: err.message,
				errors: [err.message],
			});
		}

		return res.status(status("INTERNAL_SERVER_ERROR")).json({
			success: false,
			status: status("INTERNAL_SERVER_ERROR"),
			message: "An error occurred during signout",
			errors: ["An error occurred during signout"],
		});
	}
};

const me = async (req, res) => {
	try {
		const userId = req.user.id;

		const user = await prisma.user.findFirst({
			where: {
				id: userId,
			},
			select: {
				id: true,
				username: true,
				email: true,
				role: true,
			},
			include: {
				Profile: true,
			},
		});

		const sessions = await sessionService.getAllSesssion(userId);

		if (!user) {
			return res.status(status("NOT_FOUND")).json({
				success: false,
				status: status("NOT_FOUND"),
				message: "User not found",
				errors: ["User not found"],
			});
		}

		return res.status(status("OK")).json({
			success: true,
			status: status("OK"),
			message: "User found",
			data: {
				user,
				sessions,
			},
		});
	} catch (err) {
		logger.error("Error during find user data:", err);

		if (err instanceof errorAPI) {
			return res.status(err.status).json({
				success: false,
				status: err.status,
				message: err.message,
				errors: [err.message],
			});
		}

		return res.status(status("INTERNAL_SERVER_ERROR")).json({
			success: false,
			status: status("INTERNAL_SERVER_ERROR"),
			message: "An error occurred during get user data",
			errors: ["An error occurred during get user data"],
		});
	}
};

const updateMe = async (req, res) => {
	try {
		const userId = req.user.id;
		const { error, value } = sanitizeAndValidate(authValidation.updateMe, req);

		if (error) {
			return res.status(status("BAD_REQUEST")).json({
				success: false,
				status: status("BAD_REQUEST"),
				message: "Validation error",
				errors: error.details.map((detail) => detail.message),
			});
		}

		const user = await prisma.profile.update({
			where: {
				user_id: userId,
			},
			data: {
				...value.body,
			},
		});

		logger.info(`${user.name} has been update the profile`);

		return res.status(status("OK")).json({
			success: true,
			status: status("OK"),
			message: "Update profile succesfull",
			data: {
				user,
			},
		});
	} catch (err) {
		logger.error("Error during update user profile:", err);

		if (err instanceof errorAPI) {
			return res.status(err.status).json({
				success: false,
				status: err.status,
				message: err.message,
				errors: [err.message],
			});
		}

		return res.status(status("INTERNAL_SERVER_ERROR")).json({
			success: false,
			status: status("INTERNAL_SERVER_ERROR"),
			message: "An error occurred during signup",
			errors: ["An error occurred during signup"],
		});
	}
};

const sendVerificationEmail = async (req, res) => {
	try {
		const user = await prisma.user.findFirst({
			where: {
				id: req.user.id,
			},
		});

		publisher.emit("userRegistered", user);

		logger.info(`${user.username} resend verification email`);

		return res.status(status("OK")).json({
			success: true,
			status: status("OK"),
			message: "Email sended",
		});
	} catch (err) {
		logger.error("Error during send verification user email:", err);

		if (err instanceof errorAPI) {
			return res.status(err.status).json({
				success: false,
				status: err.status,
				message: err.message,
				errors: [err.message],
			});
		}

		return res.status(status("INTERNAL_SERVER_ERROR")).json({
			success: false,
			status: status("INTERNAL_SERVER_ERROR"),
			message: "An error occurred during signup",
			errors: ["An error occurred during signup"],
		});
	}
};

const verifyEmail = async (req, res) => {
	try {
		const { error, value } = sanitizeAndValidate(
			authValidation.verifyEmail,
			req
		);

		if (error) {
			return res.status(status("BAD_REQUEST")).json({
				success: false,
				status: status("BAD_REQUEST"),
				message: "Validation error",
				errors: error.details.map((detail) => detail.message),
			});
		}

		const tokenTicket = await tokenService.verifyToken(
			value.params.token,
			"VerifyEmail"
		);

		const user = await prisma.user.update({
			where: {
				id: tokenTicket.user_id,
			},
			data: {
				email_verified: dayjs().format("YYYY-MM-DD HH:mm:ss"),
			},
		});

		logger.info(`${user.username} has verify her email`);

		return res.status(status("OK")).json({
			success: true,
			status: status("OK"),
			message: "Email verified",
		});
	} catch (err) {
		logger.error("Error during verify user email:", err);

		if (err instanceof errorAPI) {
			return res.status(err.status).json({
				success: false,
				status: err.status,
				message: err.message,
				errors: [err.message],
			});
		}

		return res.status(status("INTERNAL_SERVER_ERROR")).json({
			success: false,
			status: status("INTERNAL_SERVER_ERROR"),
			message: "An error occurred during signup",
			errors: ["An error occurred during signup"],
		});
	}
};

const forgotPassword = async (req, res) => {
	try {
		const { error, value } = sanitizeAndValidate(
			authValidation.forgotPassword,
			req
		);

		if (error) {
			return res.status(status("BAD_REQUEST")).json({
				success: false,
				status: status("BAD_REQUEST"),
				message: "Validation error",
				errors: error.details.map((detail) => detail.message),
			});
		}

		const passwordResetPasswordToken =
			await tokenService.generateResetPasswordToken();

		publisher.emit(
			"userForgotPassword",
			value.body.email,
			passwordResetPasswordToken
		);

		logger.info(`${value.body.email} has make request password reset`);

		res.status(status("OK")).json({
			success: true,
			status: status("OK"),
			message: "Email sended, check your email box",
		});
	} catch (err) {
		logger.error("Error during send email user password reset:", err);

		if (err instanceof errorAPI) {
			return res.status(err.status).json({
				success: false,
				status: err.status,
				message: err.message,
				errors: [err.message],
			});
		}

		return res.status(status("INTERNAL_SERVER_ERROR")).json({
			success: false,
			status: status("INTERNAL_SERVER_ERROR"),
			message: "An error occurred during signup",
			errors: ["An error occurred during signup"],
		});
	}
};

const passwordReset = async (req, res) => {
	try {
		const { error, value } = sanitizeAndValidate(
			authValidation.resetPassword,
			req
		);

		if (error) {
			return res.status(status("BAD_REQUEST")).json({
				success: false,
				status: status("BAD_REQUEST"),
				message: "Validation error",
				errors: error.details.map((detail) => detail.message),
			});
		}

		const tokenTicket = await tokenService.verifyToken(
			value.params.token,
			"PasswordReset"
		);

		const user = await prisma.user.update({
			where: {
				id: tokenTicket.user_id,
			},
			data: {
				password: value.body.password,
			},
		});

		logger.info(`${user.username} has reseting password`);

		return res.status(status("OK")).json({
			success: true,
			status: status("OK"),
			message: "Password has reseted",
		});
	} catch (err) {
		logger.error("Error during reset user password:", err);

		if (err instanceof errorAPI) {
			return res.status(err.status).json({
				success: false,
				status: err.status,
				message: err.message,
				errors: [err.message],
			});
		}

		return res.status(status("INTERNAL_SERVER_ERROR")).json({
			success: false,
			status: status("INTERNAL_SERVER_ERROR"),
			message: "An error occurred during signup",
			errors: ["An error occurred during signup"],
		});
	}
};

// OAuth Google

const loginWithGoogle = passport.authenticate("google", {
	scope: ["profile", "email"],
});

const googleCallback = async (req, res) => {
	try {
		const user = req.user;
		const accessToken = await tokenService.generateAccessToken(user);
		const refreshToken = await tokenService.generateRefreshToken(user);
		const csrfToken = await tokenService.generateCsrfToken();

		await sessionService.setSession(
			user.id,
			refreshToken,
			req.ip,
			req.headers["user-agent"]
		);

		logger.info(`${user.name} has been signin with google`);

		res.cookie("refresh_token", refreshToken, {
			httpOnly: true,
			secure: true,
			signed: true,
			sameSite: "Lax",
		});

		return res.status(status("OK")).json({
			success: true,
			status: status("OK"),
			message: "Signin successfull",
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
		logger.error("Error during signin with google:", err);

		if (err instanceof errorAPI) {
			return res.status(err.status).json({
				success: false,
				status: err.status,
				message: err.message,
				error: [err.message],
			});
		}

		return res.status(status("INTERNAL_SERVER_ERROR")).json({
			success: false,
			status: status("INTERNAL_SERVER_ERROR"),
			message: "An error occurred during signin.",
			errors: ["An error occurred during signin."],
		});
	}
};

// OAuth Facebook

const loginWithFacebook = passport.authenticate("facebook");

const facebookCallback = async (req, res) => {
	try {
		const user = req.user;
		const accessToken = await tokenService.generateAccessToken(user);
		const refreshToken = await tokenService.generateRefreshToken(user);
		const csrfToken = await tokenService.generateCsrfToken();

		await sessionService.setSession(
			user.id,
			refreshToken,
			req.ip,
			req.headers["user-agent"]
		);

		logger.info(`${user.name} has been signin with facebook`);

		res.cookie("refresh_token", refreshToken, {
			httpOnly: true,
			secure: true,
			signed: true,
			sameSite: "Lax",
		});

		return res.status(status("OK")).json({
			success: true,
			status: status("OK"),
			message: "Signin successfull",
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
		logger.error("Error during signin with facebook:", err);

		if (err instanceof errorAPI) {
			return res.status(err.status).json({
				success: false,
				status: err.status,
				message: err.message,
				error: [err.message],
			});
		}

		return res.status(status("INTERNAL_SERVER_ERROR")).json({
			success: false,
			status: status("INTERNAL_SERVER_ERROR"),
			message: "An error occurred during signin.",
			errors: ["An error occurred during signin."],
		});
	}
};

// Open ID authentication



export default {
	signup,
	signin,
	signout,
	refresh,
	me,
	updateMe,
	sendVerificationEmail,
	verifyEmail,
	forgotPassword,
	passwordReset,
	loginWithGoogle,
	googleCallback,
	loginWithFacebook,
	facebookCallback
};
