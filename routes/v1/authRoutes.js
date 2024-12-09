import { Router } from "express";
import passport from "passport";
import middleware from "../../src/utils/middleware.js";
import control from "../../src/utils/control.js";
import sanitizeAndValidate from "../../src/utils/validate.js";
import authController from "../../src/controllers/authController.js";
import authValidation from "../../src/validations/authValidation.js";

const router = Router();

router.post(
	"/signup",
	middleware("guest"),
	sanitizeAndValidate(authValidation.signup),
	control(authController.signup)
);
router.post(
	"/signin",
	middleware("guest"),
	sanitizeAndValidate(authValidation.signin),
	control(authController.signin)
);
router.get("/signout", middleware("auth"), control(authController.signout));

router.get("/refresh", control(authController.refresh));
router.get("/account", middleware("auth"), control(authController.account));
router.patch(
	"/account/update",
	middleware("auth"),
	sanitizeAndValidate(authValidation.updateAccount),
	control(authController.updateAccount)
);
router.delete(
	"/account/delete",
	middleware("auth"),
	control(authController.deleteAccount)
);

router.get(
	"/send-verification-email",
	middleware("auth"),
	control(authController.sendVerificationEmail)
);
router.patch(
	"/verify-email/:token",
	sanitizeAndValidate(authValidation.verifyEmail),
	control(authController.verifyEmail)
);
router.get(
	"/forgot-password",
	sanitizeAndValidate(authValidation.forgotPassword),
	control(authController.forgotPassword)
);
router.patch(
	"/reset-passowrd/:token",
	sanitizeAndValidate(authValidation.resetPassword),
	control(authController.passwordReset)
);

// OAuth Google

router.get("/google", middleware("guest"), authController.loginWithGoogle);
router.get(
	"/google/callback",
	middleware("guest"),
	passport.authenticate("google", { failureRedirect: "/login" }),
	control(authController.googleCallback)
);

// OAuth Facebook

router.get("/facebook", middleware("guest"), authController.loginWithFacebook);
router.get(
	"/facebook/callback",
	middleware("guest"),
	passport.authenticate("facebook", { failureRedirect: "/login" }),
	control(authController.facebookCallback)
);

export default router;
