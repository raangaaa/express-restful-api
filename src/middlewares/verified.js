import tokenService from "../services/tokenService.js";
import errorAPI from "../utils/errorAPI.js";

// Chech the user email are verified in JWT payload
const verified = async (req, res, next) => {
    try {
        const accessToken = req.headers["authorization"] || req.headers["Authorization"];

        if (!accessToken) {
            throw new errorAPI("Access token missing", 401);
        }

        if (!accessToken.startsWith("Bearer ")) {
            throw new errorAPI("Invalid access token format", 401);
        }

        const token = accessToken.split(" ")[1];

        const payload = await tokenService.verifyAccessToken(token);

        if (!payload || !payload.email_verified) {
            return next(new errorAPI("Email not verified", 403));
        }

        next();
    } catch (err) {
        throw err;
    }
};

export default verified;
