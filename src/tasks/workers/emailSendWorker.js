import { workerData, parentPort } from "worker_threads";
import emailService from "../../services/emailService/emailService.js";

const emailHandler = {
	verificationEmail: async ({ emailTo, verificationEmailToken }) => {
		if (!verificationEmailToken) throw new Error("verificationEmailToken is required");
		return await emailService.sendEmailVerification(emailTo, verificationEmailToken);
	},
	passwordResetEmail: async ({ emailTo, passwordResetToken }) => {
		if (!passwordResetToken) throw new Error("passwordResetToken is required");
		return await emailService.sendPasswordResetEmail(emailTo, passwordResetToken);
	},
};

const sendEmailWorker = async () => {
	try {
		const { typeEmail, ...data } = workerData;

		if (!typeEmail || emailHandler[typeEmail]) {
			parentPort.postMessage({ error: "typeEmail is invalid" });
			return;
		}

		const result = await emailHandler[typeEmail](data);

		parentPort.postMessage(
			"Worker success send email: " + JSON.stringify(result)
		);
	} catch (err) {
		parentPort.postMessage({ error: err.message });
	}
};

sendEmailWorker();
