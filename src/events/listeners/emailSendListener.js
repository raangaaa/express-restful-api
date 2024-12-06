import publisher from "../eventEmitter";
import emailService from "../../../src/services/emailService/emailService.js";
import { logger } from "../../../configs/logging.js";

publisher.on("userRegistered", async (user) => {
	logger.info(
		`Sending email verification to ${user.username} <${user.email}> ...`
	);
	try {
		await emailService.sendEmailVerification(user.email);
	} catch (err) {
		logger.error(
			`Failed to send email verification to ${user.username} <${user.email}>`
		);
	}
});

publisher.on("userForgotPassword", async (userEmail, passwordResetToken) => {
	logger.info(`Sending email password reset to <${userEmail}> ...`);
	try {
		await emailService.sendPasswordResetEmail(userEmail, passwordResetToken);
	} catch (err) {
		logger.error(`Failed to send email password reset to<${userEmail}>`);
	}
});
