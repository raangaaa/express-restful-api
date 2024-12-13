import winston from "winston";
import morgan from "morgan";
import env from "../../configs/env.js";

// Configuration for logging application 

const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	debug: 4,
	database: 5,
};

winston.addColors({
	error: "red",
	warn: "yellow",
	info: "cyan",
	http: "green",
	debug: "white",
	database: "blue",
});

export const logger = winston.createLogger({
	level: env.NODE_ENV === "development" ? "debug" : "warn",
	levels,
	format: winston.format.combine(
		winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		winston.format.printf(
			(info) => `[${[info.timestamp]}] [${info.level}] => ${info.message}`
		)
	),
	transports: [
		new winston.transports.File({
			level: "http",
			filename: "storages/logs/http.log",
			maxsize: "10000000",
			maxFiles: "10",
		}),
		new winston.transports.File({
			level: "database",
			filename: "storages/logs/database.log",
			maxsize: "10000000",
			maxFiles: "10",
		}),
		new winston.transports.File({
			level: "error",
			filename: "storages/logs/error.log",
			maxsize: "10000000",
			maxFiles: "10",
		}),
		new winston.transports.File({
			filename: "storages/logs/combined.log",
			maxsize: "10000000",
			maxFiles: "10",
		}),
		new winston.transports.Console({
			format: winston.format.combine(winston.format.colorize({ all: true })),
		}),
	],
});

export const logHTTP = morgan("combined", {
	stream: { write: (message) => logger.http(message.trim()) },
});