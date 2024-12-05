import { Router } from "express";
import middleware from "@utils/middleware"
import authController from "@controllers/authController"

const router = Router();


router.post("/signup", middleware("guest"), authController.signup);
router.post("/signin", middleware("guest"), authController.signin);
router.get("/signout", middleware("auth"), authController.signout);

router.get("/refresh", authController.refresh);
router.get("/me", middleware("auth"), authController.me);
router.patch("/me", middleware("auth"), authController.updateMe);

export default router;