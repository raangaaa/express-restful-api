import { Router } from "express";
import middleware from "@utils/middleware"
import authController from "@controllers/authController"

const router = Router();


router.post('/signup', middleware('guest'), authController.signup);

export default router;