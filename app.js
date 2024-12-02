import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import { logHTTP } from "./configs/logging";
import corsOptions from "./configs/cors";
import http2 from "http2";
import fs from "fs";
import env from "./configs/env";
import routes from "./routes/routes";
import error from "./src/middlewares/error"

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cors(corsOptions));
app.use(logHTTP());
app.use(express.static("public"));
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
