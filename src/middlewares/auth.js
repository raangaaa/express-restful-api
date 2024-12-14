import tokenService from "../services/tokenService.js";
import errorAPI from "../utils/errorAPI.js";

// Check request have Authorization Bearer token with valid JWT token
// if token not provided or invalid or expired will handled function middleware in utils directory to next request to error middleware
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
