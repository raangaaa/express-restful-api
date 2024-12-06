import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import http2 from "http2";
import fs from "fs";
import passport from "passport";
import "./configs/passport.js"
import { logHTTP } from "./configs/logging.js";
import corsOptions from "./configs/cors.js";
import env from "./configs/env.js";
import routes from "./routes/routes.js";
import error from "./src/middlewares/error.js"
import csrfMiddleware from "./src/middlewares/csrf.js";
import rateLimiter from "./src/middlewares/rateLimiter.js";

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(rateLimiter);
app.use(csrfMiddleware);
app.use(cookieParser(env.COOKIE_SECRET));
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(compression());
app.use(logHTTP());
app.use("/api/v1", routes);
app.use(error.notFound);
app.use(error.handler);

const serverOptions = {
	key: fs.readFileSync("./ssl/server.key"),
	cert: fs.readFileSync("./ssl/server.crt"),
	allowHTTP1: true,
};

const server = http2.createSecureServer(serverOptions, app);

server.listen(env.PORT, () => {
	console.log(`Server HTTP/2 berjalan di https://${env.HOST}:${env.PORT}`);
});
