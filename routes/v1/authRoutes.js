import { Router } from "express";
import middleware from "../../src/utils/middleware"
import authController from "../../src/controllers/authController"

const router = Router();


router.post('/signup', middleware('guest'), authController.signup);

export default router;