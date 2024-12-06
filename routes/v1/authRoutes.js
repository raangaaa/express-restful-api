import { Router } from "express";
import middleware from "../../src/utils/middleware.js"
import authController from "../../src/controllers/authController.js"

const router = Router();


router.post("/signup", middleware("guest"), authController.signup);
router.post("/signin", middleware("guest"), authController.signin);
router.get("/signout", middleware("auth"), authController.signout);

router.get("/refresh", authController.refresh);
router.get("/me", middleware("auth"), authController.me);
router.patch("/me", middleware("auth"), authController.updateMe);

router.get("/send-verification-email", middleware("auth"), authController.sendVerificationEmail);
router.patch("/verify-email/:token", authController.verifyEmail);
router.get("/forgot-password", authController.forgotPassword);
router.patch("/reset-passowrd/:token", authController.passwordReset);

export default router;