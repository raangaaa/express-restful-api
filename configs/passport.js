import passport from "passport";
import { Steategy as GoogleStrategy } from "passport-google-oauth20";
import { Steategy as FacebookStrategy } from "passport-facebook";
import env from "./env";
import prisma from "../prisma/prisma";
import tokenService from "../src/services/tokenService";
import dayjs from "dayjs";

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
				const existingUser = await prisma.user.findUnique({
					where: {
						email: profile.emails[0].value,
						oauth_id: null,
					},
				});

				if (existingUser) {
					return done(null, existingUser);
				} else {
					const newUser = await prisma.user.create({
						data: {
							email: profile.emails[0].value,
							password: await tokenService.generateRandomToken(50),
							username: `${profile.displayName
								.replace(" ", "_")
								.toLowerCase()}_${profile.emails[0].value.split("@")[0]}`,
							email_verified: dayjs().format("YYYY-MM-DD HH:mm:ss"),
							Profile: {
								create: {
									name: profile.displayName,
								},
							},
						},
					});

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
				const existingUser = await prisma.user.findUnique({
					where: {
						email: profile.emails[0].value,
						oauth_id: null,
					},
				});

				if (existingUser) {
					return done(null, existingUser);
				} else {
					const newUser = await prisma.user.create({
						data: {
							email: profile.emails[0].value,
							password: await tokenService.generateRandomToken(50),
							username: `${profile.displayName
								.replace(" ", "_")
								.toLowerCase()}_${profile.emails[0].value.split("@")[0]}`,
							email_verified: dayjs().format("YYYY-MM-DD HH:mm:ss"),
							Profile: {
								create: {
									name: profile.displayName,
								},
							},
						},
					});

					return done(null, newUser);
				}
			} catch (error) {
				return done(error, null);
			}
		}
	)
);