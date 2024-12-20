import dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

const envValidate = Joi.object()
	.keys({
		NODE_ENV: Joi.string()
			.valid("production", "development", "test")
			.required(),
		APP_NAME: Joi.string().allow("").empty("").default("Express RESTful API"),
		HOST: Joi.string().allow("").empty("").default("127.0.0.1"),
		PORT: Joi.number().allow("").empty("").default(3000),

		DATABASE_URL: Joi.string().required(),
		FRONTEND_URL: Joi.string()
			.allow("")
			.empty("")
			.default("http://localhost:777"),

		CACHE_DRIVER: Joi.string().allow("").empty(""),
		CACHE_PREFIX: Joi.string().allow("").empty(""),

		REDIS_USERNAME: Joi.string().allow("").empty(""),
		REDIS_PASSWORD: Joi.string().allow("").empty(""),
		REDIS_HOST: Joi.string().allow("").empty("").default("127.0.0.1"),
		REDIS_PORT: Joi.number().allow("").empty("").default(6379),

		MEMCACHED_USERNAME: Joi.string().allow("").empty(""),
		MEMCACHED_PASSWORD: Joi.string().allow("").empty(""),
		MEMCACHED_HOST: Joi.string().allow("").empty("").default("127.0.0.1"),
		MEMCACHED_PORT: Joi.number().allow("").empty("").default(11211),

		SMTP_HOST: Joi.string().allow("").empty(""),
		SMTP_PORT: Joi.number().allow("").empty(""),
		SMTP_USERNAME: Joi.string().allow("").empty(""),
		SMTP_PASSWORD: Joi.string().allow("").empty(""),
		EMAIL_FROM: Joi.string().allow("").empty(""),

		OAUTH_GOOGLE_CLIENT_ID: Joi.string().allow("").empty(""),
		OAUTH_GOOGLE_CLIENT_SECRET: Joi.string().allow("").empty(""),
			
		OAUTH_FACEBOOK_APP_ID: Joi.string().allow("").empty(""),
		OAUTH_FACEBOOK_APP_SECRET: Joi.string().allow("").empty(""),

		VERIFY_EMAIL_TOKEN_EXPIRATION_MINUTES: Joi.number()
			.allow("")
			.empty("")
			.default(60),
		RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES: Joi.number()
			.allow("")
			.empty("")
			.default(30),

		CSRF_SECRET: Joi.string().required(),
		COOKIE_SECRET: Joi.string().required(),

		REFRESH_TOKEN_EXPIRATION_DAYS: Joi.number().allow("").empty("").default(15),
		REFRESH_TOKEN_SECRET_PRIVATE: Joi.string().required(),
		REFRESH_TOKEN_SECRET_PUBLIC: Joi.string().required(),

		ACCESS_TOKEN_SECRET_PRIVATE: Joi.string().required(),
		ACCESS_TOKEN_SECRET_PUBLIC: Joi.string().required(),
		ACCESS_TOKEN_EXPIRATION_MINUTES: Joi.number()
			.allow("")
			.empty("")
			.default(30),
	})
	.unknown();

const { value: env, error } = envValidate
	.prefs({ errors: { label: "key" } })
	.validate(process.env);

if (error) {
	throw new Error(`Config env error: ${error.message}`);
}

export default {
	NODE_ENV: env.NODE_ENV,
	APP_NAME: env.APP_NAME,
	HOST: env.HOST,
	PORT: env.PORT,

	DATABASE_URL: env.DATABASE_URL,
	FRONTEND_URL: env.FRONTEND_URL,

	CACHE_DRIVER: env.CACHE_DRIVER,
	CACHE_PREFIX: env.CACHE_PREFIX,

	REDIS_USERNAME: env.REDIS_USERNAME,
	REDIS_PASSWORD: env.REDIS_PASSWORD,
	REDIS_HOST: env.REDIS_HOST,
	REDIS_PORT: env.REDIS_PORT,

	MEMCACHED_USERNAME: env.MEMCACHED_USERNAME,
	MEMCACHED_PASSWORD: env.MEMCACHED_PASSWORD,
	MEMCACHED_HOST: env.MEMCACHED_HOST,
	MEMCACHED_PORT: env.MEMCACHED_PORT,

	SMTP_HOST: env.SMTP_HOST,
	SMTP_PORT: env.SMTP_PORT,
	SMTP_USERNAME: env.SMTP_USERNAME,
	SMTP_PASSWORD: env.SMTP_PASSWORD,
	EMAIL_FROM: env.EMAIL_FROM,

	OAUTH_GOOGLE_CLIENT_ID: env.OAUTH_GOOGLE_CLIENT_ID,
	OAUTH_GOOGLE_CLIENT_SECRET: env.OAUTH_GOOGLE_CLIENT_SECRET,

	OAUTH_FACEBOOK_APP_ID: env.OAUTH_FACEBOOK_APP_ID,
	OAUTH_FACEBOOK_APP_SECRET: env.OAUTH_FACEBOOK_APP_SECRET,

	VERIFY_EMAIL_TOKEN_EXPIRATION_MINUTES:
		env.VERIFY_EMAIL_TOKEN_EXPIRATION_MINUTES,
	RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES:
		env.RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES,

	CSRF_SECRET: Buffer.from(env.CSRF_SECRET, "base64"),
	COOKIE_SECRET: Buffer.from(env.COOKIE_SECRET, "base64"),

	REFRESH_TOKEN_EXPIRATION_DAYS: env.REFRESH_TOKEN_EXPIRATION_DAYS,
	REFRESH_TOKEN_SECRET_PRIVATE: Buffer.from(
		env.REFRESH_TOKEN_SECRET_PRIVATE,
		"base64"
	),
	REFRESH_TOKEN_SECRET_PUBLIC: Buffer.from(
		env.REFRESH_TOKEN_SECRET_PUBLIC,
		"base64"
	),

	ACCESS_TOKEN_EXPIRATION_MINUTES: env.ACCESS_TOKEN_EXPIRATION_MINUTES,
	ACCESS_TOKEN_SECRET_PRIVATE: Buffer.from(
		env.ACCESS_TOKEN_SECRET_PRIVATE,
		"base64"
	),
	ACCESS_TOKEN_SECRET_PUBLIC: Buffer.from(
		env.ACCESS_TOKEN_SECRET_PUBLIC,
		"base64"
	),
};
