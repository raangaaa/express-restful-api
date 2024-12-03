import prisma from "~/prisma/prisma";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import sanitizeAndValidate from "@utils/validate";
import authValidation from "@validations/authValidation";
import { logger } from "~/configs/logging"

prisma.$on("query", (e) => {
	logger.log({
		level: "database",
		message: `Query: ${e.query}\nParams: ${e.params}\nDuration: ${e.duration}ms`,
	});
});

const signup = async (req, res) => {
	try {
		const { error, value } = sanitizeAndValidate(authValidation.signup, req);

		if (error) {
			return res.status(httpStatus.BAD_REQUEST).json({
				message: "Validation error",
				errors: error.details.map((detail) => detail.message),
			});
		}

		const hashedPassword = await bcrypt.hash(value.body.password, 12);

		const user = await prisma.user.create({
			data: {
				...value.body,
				password: hashedPassword,
			},
		});

		logger.info(`${user.name} has been registered to the system`);

		return res.status(httpStatus.CREATED).json({
			success: true,
			status: httpStatus.CREATED,
			data: {
				id: user.id,
				name: user.name,
				username: user.username,
				email: user.email,
			},
		});
	} catch (err) {
		logger.error("Error during signup:", err);
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			message: "An error occurred during signup.",
			error: err.message,
		});
	}
};

const signin = async (req, res) => {
	try {
		const { error, value } = sanitizeAndValidate(authValidation.signin, req);

		if (error) {
			return res.status(httpStatus.BAD_REQUEST).json({
				message: "Validation error",
				errors: error.details.map((detail) => detail.message),
			});
		}

		const user = await prisma.user.findFirst({
			where: {
				OR: [
					{ email: value.body.email },
					{ username: value.body.username },
				],
			},
		});

		if (!user) {
			return res.status(httpStatus.UNAUTHORIZED).json({
				message: "Invalid credentials.",
			});
		}

		const isPasswordValid = await bcrypt.compare(
			value.body.password,
			user.password
		);

		if (!isPasswordValid) {
			return res.status(httpStatus.UNAUTHORIZED).json({
				message: "Invalid credentials.",
			});
		}


		logger.info(`${user.name} has been signin to the system`);

		return res.status(httpStatus.OK).json({
			success: true,
			status: httpStatus.OK,
			data: {
				id: user.id,
				name: user.name,
				username: user.username,
				email: user.email,
			},
		});
	} catch (err) {
		logger.error("Error during signin:", err);
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			message: "An error occurred during signin.",
			error: err.message,
		});
	}
};

export default { signup, signin };
