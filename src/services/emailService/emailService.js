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

const sendEmailVerification = async (emailTo, verificationEmailToken) => {
    try {
        const subject = `${env.APP_NAME} - Verify your email address`;
        const html = templateHTML.verifyEmail(`${env.FRONTEND_URL}/${verificationEmailToken}`);

        return await sendEmail(emailTo, subject, html);
    } catch (err) {
        return err;
    }
};

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
