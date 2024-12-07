import passport from "passport";
import { Steategy as GoogleStrategy } from "passport-google-oauth20";
import { Steategy as FacebookStrategy } from "passport-facebook";
import dayjs from "dayjs";
import env from "./env.js";
import prisma from "../prisma/prisma.js";
import tokenService from "../src/services/tokenService.js";
import userService from "../src/services/crud/userService.js";

// Google
passport.use(
	new GoogleStrategy(
		{
			clientID: env.OAUTH_GOOGLE_CLIENT_ID,
			clientSecret: env.OAUTH_GOOGLE_CLIENT_SECRET,
			callbackURL: `https://${env.HOST}:${env.PORT}/api/v1/auth/google/callback`,
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				const { existingUser, newUser } = await userService.findOrCreate(
					{
						email: profile.emails[0].value,
						google_id: null,
					},
					{
						email: profile.emails[0].value,
						password: await tokenService.generateRandomToken(50),
						username: `${profile.displayName.replace(" ", "_").toLowerCase()}_${
							profile.emails[0].value.split("@")[0]
						}`,
						email_verified: dayjs().format("YYYY-MM-DD HH:mm:ss"),
						Profile: {
							create: {
								name: profile.displayName,
							},
						},
					}
				);

				if (existingUser) {
					return done(null, existingUser);
				} else {
					return done(null, newUser);
				}
			} catch (error) {
				return done(error, null);
			}
		}
	)
);

// Facebook
passport.use(
	new FacebookStrategy(
		{
			clientID: env.OAUTH_FACEBOOK_APP_ID,
			clientSecret: env.OAUTH_FACEBOOK_APP_SECRET,
			callbackURL: `https://${env.HOST}:${env.PORT}/api/v1/auth/facebook/callback`,
			profileFields: ["id", "displayName", "email"],
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				const { existingUser, newUser } = await userService.findOrCreate(
					{
						email: profile.emails[0].value,
						facebook_id: null,
					},
					{
						email: profile.emails[0].value,
						password: await tokenService.generateRandomToken(50),
						username: `${profile.displayName.replace(" ", "_").toLowerCase()}_${
							profile.emails[0].value.split("@")[0]
						}`,
						email_verified: dayjs().format("YYYY-MM-DD HH:mm:ss"),
						Profile: {
							create: {
								name: profile.displayName,
							},
						},
					}
				);

				if (existingUser) {
					return done(null, existingUser);
				} else {
					return done(null, newUser);
				}
			} catch (error) {
				return done(error, null);
			}
		}
	)
);
