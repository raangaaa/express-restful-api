import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import dayjs from "dayjs";
import env from "./env.js";
import tokenService from "../src/services/tokenService.js";
import userService from "../src/services/crud/userService.js";
import errorAPI from "../src/utils/errorAPI.js";

// Google
passport.use(
    new GoogleStrategy(
        {
            clientID: env.OAUTH_GOOGLE_CLIENT_ID,
            clientSecret: env.OAUTH_GOOGLE_CLIENT_SECRET,
            callbackURL: `https://${env.HOST}:${env.PORT}/api/v1/auth/google/callback`
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const { existingUser, newUser } = await userService.findOrCreate({
                    username: `user${await tokenService.generateRandomToken(20)}${profile.emails[0].value.split("@")[0]}`,
                    password: await tokenService.generateRandomToken(50),
                    email: profile.emails[0].value,
                    email_verified: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    oauth_id: profile.id,
                    oauth_provider: "google",
                    Profile: {
                        create: {
                            name: profile.displayName
                        }
                    }
                });

                if (existingUser) {
                    if (existingUser.oauth_provider !== "google") {
                        return done(null, new errorAPI("Sign in failed", 401, ["Invaid Sign in method"]));
                    }
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
            profileFields: ["id", "displayName", "email"]
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const { existingUser, newUser } = await userService.findOrCreate({
                    username: `user${await tokenService.generateRandomToken(20)}_${profile.emails[0].value.split("@")[0]}`,
                    password: await tokenService.generateRandomToken(50),
                    email: profile.emails[0].value,
                    email_verified: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    oauth_id: profile.id,
                    oauth_provider: "facebook",
                    Profile: {
                        create: {
                            name: profile.displayName
                        }
                    }
                });

                if (existingUser) {
                    if (existingUser.oauth_provider !== "facebook") {
                        return done(null, new errorAPI("Sign in failed", 401, ["Invaid Sign in method"]));
                    }
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
