import errorAPI from "../utils/errorAPI.js";

const guest = (req, res, next) => {
	if (req.headers["authorization"] || req.signedCookies["refresh_token"]) {
		throw new errorAPI("Only guest user can access this", 400);
	}

	next();
};

export default guest;
