import tokenService from "../services/tokenService.js";
import errorAPI from "../utils/errorAPI.js";

const auth = async (req, res, next) => {
    try {
        const accessToken = req.headers["authorization"] || req.headers["Authorization"];

        if (!accessToken) {
            throw new errorAPI("Access token missing", 401);
        }

        if (!accessToken.startsWith("Bearer ")) {
            throw new errorAPI("Invalid access token format", 401);
        }

        const token = accessToken.split(" ")[1];

        const payloadAccessToken = await tokenService.verifyAccessToken(token);

        req.user = payloadAccessToken;

        next();
    } catch (err) {
        throw err;
    }
};

export default auth;
