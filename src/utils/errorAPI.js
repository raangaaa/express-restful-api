class errorAPI extends Error {
	constructor(message, status) {
		super(message);
		this.name = this.constructor.name;
		this.message = message;
		this.status = status;
		Error.captureStackTrace(this, this.constructor);
	}
}

export default errorAPI;
