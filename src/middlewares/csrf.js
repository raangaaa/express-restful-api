import status from "statuses";
import tokenService from "../services/tokenService.js";

const csrfMiddleware = async (req, res, next) => {
	const csrfHeader = req.headers["x-csrf-token"] || req.headers["X-CSRF-Token"];

	if (!csrfHeader) {
		if (req.method === "GET") {
			const token = await tokenService.generateCsrfToken();
			res.setHeader("X-CSRF-Token", token);
			return next();
		}

		return res.status(status("FORBIDDEN")).json({
			sucess: false,
			status: status("FORBIDDEN"),
			message: "CSRF token missing",
			error: "CSRF token missing",
		});
	}

	if (["POST", "PUT", "DELETE"].includes(req.method)) {
		const isValid = await tokenService.verifyCsrfToken(csrfHeader);
		if (!isValid) {
			return res.status(status("FORBIDDEN")).json({
				success: false,
				status: status("FORBIDDEN"),
				message: "CSRF token mismatch or invalid",
				error: "CSRF token mismatch or invalid",
			});
		}
	}

	next();
};

export default csrfMiddleware;