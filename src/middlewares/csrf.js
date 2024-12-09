import tokenService from "../services/tokenService.js";

const csrfMiddleware = async (req, res, next) => {
    const csrfHeader = req.headers["x-csrf-token"] || req.headers["X-CSRF-Token"];

    if (!csrfHeader) {
        if (req.method === "GET") {
            const token = await tokenService.generateCsrfToken();
            res.setHeader("X-CSRF-Token", token);
            return next();
        }

        return res.status(403).json({
            sucess: false,
            statusCode: 403,
            message: "CSRF token missing",
            errors: ["CSRF token missing"]
        });
    }

    if (["POST", "PUT", "DELETE"].includes(req.method)) {
        const isValid = await tokenService.verifyCsrfToken(csrfHeader);
        if (!isValid) {
            return res.status(403).json({
                success: false,
                statusCode: 403,
                message: "CSRF token mismatch or invalid",
                errors: ["CSRF token mismatch or invalid"]
            });
        }
    }

    next();
};

export default csrfMiddleware;
