import env from "./env.js"

// Configuration for cors options with library cors

const origin = [env.FRONTEND_URL]

const methods = ["GET", "HEAD", "POST", "PUT", "PATCH", "POST", "OPTIONS"]

const corsOptions = {
	origin,
	methods,
	preflightContinue: true,
	optionsSuccessStatus: 200,
	credentials: true,
	maxAge: 600,
};

export default corsOptions;