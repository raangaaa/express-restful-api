import errorAPI from "@utils/errorAPI";
import status from "statuses";

const guest = (req, res, next) => {
	if (req.headers["authorization"] || req.signedCookies["refresh_token"]) {
		return next(
			new errorAPI("Only guest user can access this", status("BAD_REQUEST"))
		);
	}

	next();
};

export default guest;
