import nodemailer from "nodemailer";
import templateHTML from "./templateHTML.js";
import env from "../../../configs/env.js";

const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
        user: env.SMTP_USERNAME,
        pass: env.SMTP_PASSWORD
    }
});

/**
 * Sends an email using the configured transport.
 * @async
 * @param {String} emailTo - The recipient's email address.
 * @param {String} subject - The subject of the email.
 * @param {String} html - The HTML content of the email.
 * @returns {Promise<Object|Error>} - The result of the email sending operation or an error object if it fails.
 */
const sendEmail = async (emailTo, subject, html) => {
    try {
        return await transport.sendMail({
            from: `${env.APP_NAME}  <${env.EMAIL_FROM}>`,
            to: emailTo,
            subject,
            html
        });
    } catch (err) {
        return err;
    }
};

/**
 * Sends an email verification message to the specified email address.
 * @async
 * @param {String} emailTo - The recipient's email address.
 * @param {String} verificationEmailToken - The token used to verify the email address.
 * @returns {Promise<Object|Error>} - The result of the email sending operation or an error object if it fails.
 */
const sendEmailVerification = async (emailTo, verificationEmailToken) => {
    try {
        const subject = `${env.APP_NAME} - Verify your email address`;
        const html = templateHTML.verifyEmail(`${env.FRONTEND_URL}/${verificationEmailToken}`);

        return await sendEmail(emailTo, subject, html);
    } catch (err) {
        return err;
    }
};

/**
 * Sends a password reset email to the specified email address.
 * @async
 * @param {String} emailTo - The recipient's email address.
 * @param {String} passwordResetToken - The token used to reset the user's password.
 * @returns {Promise<Object|Error>} - The result of the email sending operation or an error object if it fails.
 */
const sendPasswordResetEmail = async (emailTo, passwordResetToken) => {
    try {
        const subject = `${env.APP_NAME} - Reset your password`;
        const html = templateHTML.passwordReset(`${env.FRONTEND_URL}/${passwordResetToken}`);

        return await sendEmail(emailTo, subject, html);
    } catch (err) {
        return err;
    }
};

export default { sendEmail, sendEmailVerification, sendPasswordResetEmail };
