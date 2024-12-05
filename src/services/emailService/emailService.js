import nodemailer from "nodemailer";
import templateHTML from "./templateHTML.js";
import env from "../../../configs/env.js";

const transport = nodemailer.createTransport({
	host: env.SMTP_HOST,
	port: env.SMTP_PORT,
	auth: {
		user: env.SMTP_USERNAME,
		pass: env.SMTP_PASSWORD,
	},
});

const sendEmail = async (emailTo, subject, html) => {
	try {
		const info = await transport.sendMail({
			from: `${env.APP_NAME}  <${env.EMAIL_FROM}>`,
			to: emailTo,
			subject,
			html,
		});

		console.log("Email send to: %s", emailTo);
	} catch (error) {
		console.error("Failed send email: ", error);
	}
};

const sendVerifyEmail = async (emailTo, verifyEmailToken) => {
	try {
		const subject = `${env.APP_NAME} - Verify your email address`;
		const html = templateHTML.verifyEmail(
			`${env.FRONTEND_URL}/${verifyEmailToken}`
		);

		await sendEmail(emailTo, subject, html);
	} catch (error) {
		console.error("Failed send email: ", error);
	}
};

const sendPasswordResetEmail = async (emailTo, passwordResetToken) => {
	try {
		const subject = `${env.APP_NAME} - Reset your password`;
		const html = templateHTML.passwordReset(
			`${env.FRONTEND_URL}/${passwordResetToken}`
		);

		await sendEmail(emailTo, subject, html);
	} catch (error) {
		console.error("Failed send email: ", error);
	}
};

export default { sendEmail, sendVerifyEmail, sendPasswordResetEmail };
