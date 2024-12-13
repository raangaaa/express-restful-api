import bcrypt from "bcrypt";
import passport from "passport";
import { logger } from "../utils/logger.js";
import tokenService from "../services/tokenService.js";
import sessionService from "../services/sessionService.js";
import userService from "../services/crud/userService.js";
import startWorker from "../tasks/worker.js";
import errorAPI from "../utils/errorAPI.js";

const signup = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.data.body.password, 12);

        const user = await userService.create({
            username: req.data.body.username,
            email: req.data.body.email,
            Profile: {
                create: {
                    name: req.data.body.name
                }
            },
            password: hashedPassword
        });

        const verificationEmailToken = await tokenService.generateVerificationEmailToken(user);

        startWorker(
            {
                typeEmail: "verificationEmail",
                emailTo: user.email,
                verificationEmailToken
            },
            "emailSendWorker.js"
        );

        logger.info(`${user.name} has been registered to the system`);

        return res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Signup succesfull",
            data: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        logger.error("Error during signup:" + err);
        throw err;
    }
};

const signin = async (req, res) => {
    try {
        const user = await userService.findOne({
            OR: [{ email: req.data.body.email }, { username: req.data.body.username }]
        });

        if (!user) throw new errorAPI("Sign in failed", 401, ["Invalid credentials"]);
        if (user.oauth_id !== null || user.oauth_provider !== null) throw new errorAPI("Sign in failed", 401, ["You was sign in with other method"]);

        const isPasswordValid = await bcrypt.compare(value.body.password, user.password);
        if (!isPasswordValid) throw new errorAPI("Sign in failed", 401, ["Invalid credentials"]);

        const userData = {
            id: user.id,
            email: user.email,
            email_verified: user.email_verified
        };

        const accessToken = await tokenService.generateAccessToken(userData);
        const refreshToken = await tokenService.generateRefreshToken(userData);
        const csrfToken = await tokenService.generateCsrfToken();

        await sessionService.setSession(user.id, refreshToken, req.ip, req.headers["user-agent"]);

        logger.info(`${user.name} has been signin`);

        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: true,
            signed: true,
            sameSite: "Lax"
        });

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Signin successfull",
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    email: user.email
                },
                token: {
                    access_token: accessToken,
                    csrf_token: csrfToken,
                    refresh_token: refreshToken
                }
            }
        });
    } catch (err) {
        logger.error("Error during signin:" + err);
        throw err;
    }
};

const signout = async (req, res) => {
    try {
        const refreshToken = req.signedCookies["refresh_token"];
        await sessionService.delSession(refreshToken);
        const csrfToken = await tokenService.generateCsrfToken();

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Signout successfull",
            data: {
                token: {
                    csrf_token: csrfToken
                }
            }
        });
    } catch (err) {
        logger.error("Error during signout:" + err);
        throw err;
    }
};

const refresh = async (req, res) => {
    try {
        const refreshToken = req.signedCookies["refresh_token"];
        const currentSession = await sessionService.getOneSession(refreshToken);

        if (!currentSession) {
            throw new errorAPI("Session expired", 401, ["Refresh token expired"]);
        }

        const payloadRefreshToken = await tokenService.verifyRefreshToken(refreshToken);
        const accessToken = await tokenService.generateAccessToken(payloadRefreshToken);
        const csrfToken = await tokenService.generateCsrfToken();

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Access extended",
            data: {
                token: {
                    access_token: accessToken,
                    csrf_token: csrfToken
                }
            }
        });
    } catch (err) {
        logger.error("Error during refresh:" + err);
        throw err;
    }
};

const account = async (req, res) => {
    try {
        const user = await userService.findOne({ id: req.user.id }, { Profile: true });
        const sessions = await sessionService.getAllSesssion(req.user.id);

        if (!user) {
            throw new errorAPI("Account data not found", 404, ["Account data not found credentials"]);
        }

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "User found",
            data: {
                user,
                sessions
            }
        });
    } catch (err) {
        logger.error("Error during find user data:" + err);
        throw err;
    }
};

const updateAccount = async (req, res) => {
    try {
        const user = await userService.update({ id: req.user.id }, { ...req.data.body });

        logger.info(`${user.name} has been update the profile`);

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Update profile succesfull",
            data: {
                user
            }
        });
    } catch (err) {
        logger.error("Error during update user profile:" + err);
        throw err;
    }
};

const deleteAccount = async (req, res) => {
    try {
        await userService.destroy({ id: req.user.id });
        return res.status(204);
    } catch (err) {
        logger.error("Error during deleting user account:" + err);
        throw err;
    }
};

const sendVerificationEmail = async (req, res) => {
    try {
        const user = await userService.findOne({ id: req.user.id });
        const verificationEmailToken = await tokenService.generateVerificationEmailToken(user);

        startWorker(
            {
                typeEmail: "verificationEmail",
                emailTo: user.email,
                verificationEmailToken
            },
            "emailSendWorker.js"
        );

        logger.info(`${user.username} send verification email to ${user.email}`);

        return res.status(202).json({
            success: true,
            statusCode: 202,
            message: "Verification email request accepted"
        });
    } catch (err) {
        logger.error("Error during send verification user email:" + err);
        throw err;
    }
};

const verifyEmail = async (req, res) => {
    try {
        const tokenTicket = await tokenService.verifyToken(req.params.token, "VerificationEmail");
        const user = await userService.verifyEmail(tokenTicket.user_id);

        logger.info(`${user.username} has verify her email`);

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Email verified"
        });
    } catch (err) {
        logger.error("Error during verify user email:" + err);
        throw err;
    }
};

const forgotPassword = async (req, res) => {
    try {
        const passwordResetToken = await tokenService.generateResetPasswordToken(req.data.body.email);

        startWorker(
            {
                typeEmail: "passwordResetEmail",
                emailTo: value.body.email,
                passwordResetToken
            },
            "emailSendWorker.js"
        );

        logger.info(`${value.body.email} has make request password reset`);

        return res.status(202).json({
            success: true,
            statusCode: 202,
            message: "Password reset request accepted"
        });
    } catch (err) {
        logger.error("Error during send email user password reset:" + err);
        throw err;
    }
};

const resetPassword = async (req, res) => {
    try {
        const tokenTicket = await tokenService.verifyToken(req.params.token, "ResetPassword");
        const hashedPassword = await bcrypt.hash(req.data.body.password, 12);
        const user = await userService.update({ id: tokenTicket.user_id }, { password: hashedPassword });

        logger.info(`${user.username} has reseting password`);

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Password has reseted"
        });
    } catch (err) {
        logger.error("Error during reset user password:" + err);
        throw err;
    }
};

// OAuth Google

const loginWithGoogle = passport.authenticate("google", {
    scope: ["profile", "email"]
});

const googleCallback = async (req, res) => {
    try {
        if (req.user instanceof errorAPI) {
            throw req.user;
        }
        const user = req.user;
        const accessToken = await tokenService.generateAccessToken(user);
        const refreshToken = await tokenService.generateRefreshToken(user);
        const csrfToken = await tokenService.generateCsrfToken();

        await sessionService.setSession(user.id, refreshToken, req.ip, req.headers["user-agent"]);

        logger.info(`${user.name} has been signin with google`);

        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: true,
            signed: true,
            sameSite: "Lax"
        });

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Signin successfull",
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    email: user.email
                },
                token: {
                    access_token: accessToken,
                    csrf_token: csrfToken,
                    refresh_token: refreshToken
                }
            }
        });
    } catch (err) {
        logger.error("Error during signin with google:" + err);
        throw err;
    }
};

// OAuth Facebook

const loginWithFacebook = passport.authenticate("facebook");

const facebookCallback = async (req, res) => {
    try {
        if (req.user instanceof errorAPI) {
            throw req.user;
        }
        const user = req.user;
        const accessToken = await tokenService.generateAccessToken(user);
        const refreshToken = await tokenService.generateRefreshToken(user);
        const csrfToken = await tokenService.generateCsrfToken();

        await sessionService.setSession(user.id, refreshToken, req.ip, req.headers["user-agent"]);

        logger.info(`${user.name} has been signin with facebook`);

        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: true,
            signed: true,
            sameSite: "Lax"
        });

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Signin successfull",
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    email: user.email
                },
                token: {
                    access_token: accessToken,
                    csrf_token: csrfToken,
                    refresh_token: refreshToken
                }
            }
        });
    } catch (err) {
        logger.error("Error during signin with facebook:" + err);
        throw err;
    }
};

// Open ID Connet authentication (centralized)

export default {
    signup,
    signin,
    signout,
    refresh,
    account,
    updateAccount,
    deleteAccount,
    sendVerificationEmail,
    verifyEmail,
    forgotPassword,
    resetPassword,
    loginWithGoogle,
    googleCallback,
    loginWithFacebook,
    facebookCallback
};
