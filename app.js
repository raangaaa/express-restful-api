import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import http2 from "http2";
import fs from "fs";
import passport from "passport";
import "./configs/passport.js";
import { logHTTP, logger } from "./configs/logging.js";
import corsOptions from "./configs/cors.js";
import env from "./configs/env.js";
import routes from "./routes/routes.js";
import error from "./src/middlewares/error.js";
import csrfMiddleware from "./src/middlewares/csrf.js";
import rateLimiter from "./src/middlewares/rateLimiter.js";
import prisma from "./prisma/prisma.js";
import { redisClient } from "./src/services/cacheService.js";
import "./src/tasks/schedule.js"

const app = express();

// Middleware for security
app.use(helmet());
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'", "trusted-scripts.com"],
			styleSrc: ["'self'", "'unsafe-inline'"],
			imgSrc: ["'self'", "data:"],
		},
	})
);
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));

// Other middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));
app.use(rateLimiter);
app.use(csrfMiddleware);
app.use(cookieParser(env.COOKIE_SECRET));
app.use(passport.initialize());
app.use(express.static("public"));
app.use(compression({ threshold: 1024 }));
app.use(logHTTP());

// Routing
app.use("/api", routes);

// API error handler
app.use(error.notFound);
app.use(error.handler);


// Unhandled error handling
process.on("unhandledRejection", (reason) => {
	logger.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", async (err) => {
	logger.error("Uncaught Exception:", err);
	await prisma.$disconnect();
	await redisClient.disconnect();
	process.exit(1);
});

// Closing system
process.on("SIGTERM", async () => {
	logger.log("Server shutting down...");
	await prisma.$disconnect();
	await redisClient.disconnect();
	process.exit(0);
});
process.on("SIGINT", async () => {
	logger.log("Server interrupted...");
	await prisma.$disconnect();
	await redisClient.disconnect();
	process.exit(0);
});


// Run server
const serverOptions = {
	key: fs.readFileSync("./ssl/server.key"),
	cert: fs.readFileSync("./ssl/server.crt"),
	allowHTTP1: true,
};

const server = http2.createSecureServer(serverOptions, app);

server.listen(env.PORT, () => {
	console.log(`Server HTTP/2 berjalan di https://${env.HOST}:${env.PORT}`);
});
