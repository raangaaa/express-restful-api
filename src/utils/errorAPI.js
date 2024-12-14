/**
 * Custom error class to handle error from middleware next()
 * @class
 */
class errorAPI extends Error {
	/**
	 * Make custom error to handle error middleware
	 * @constructor
	 * @param {String} message - Error message
	 * @param {Number} status - Error status code, 4xx 5xx
	 * @param {String[]} errors - Specific error but not crucial
	 */
	constructor(message, status, errors) {
		super(message);
		this.name = this.constructor.name;
		this.message = message;
		this.status = status;
		this.errors = errors;
		Error.captureStackTrace(this, this.constructor);
	}
}

export default errorAPI;
