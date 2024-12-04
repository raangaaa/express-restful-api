import guest from "@middlewares/guest";
import auth from "@middlewares/auth";
import verified from "@middlewares/verified";

const listMiddleware = {
	guest,
	auth,
	verified,
};

const middleware = (middlewares) => async (req, res, next) => {
	try {
		if (!Array.isArray(middlewares)) {
			middlewares = [middlewares];
		}

		for (const mw of middlewares) {
			if (listMiddleware[mw]) {
				await new Promise((resolve, reject) => {
					listMiddleware[mw](req, res, (err) => {
						if (err) return reject(err);
						resolve();
					});
				});
			} else {
				throw new Error(`Middleware ${mw} tidak ditemukan.`);
			}
		}
		next();
	} catch (err) {
		next(err);
	}
};

export default middleware;
