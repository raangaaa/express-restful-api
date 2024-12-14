import errorAPI from "../utils/errorAPI.js";

// Check the request must not have Authorization token and Refresh token in cookie or headers
const guest = (req, res, next) => {
    if (req.headers["authorization"] || req.signedCookies["refresh_token"] || req.headers["X-Refresh-Token"] || req.headers["x-refresh-token"]) {
        throw new errorAPI("Only guest user can access this", 400);
    }

    next();
};

export default guest;
