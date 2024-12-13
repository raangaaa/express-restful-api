import { Router } from "express";
import authRoutes from "./v1/authRoutes.js";
import uploadRoutes from "./v1/uploadRoutes.js";

const router = Router();

router.use("/v1/auth", authRoutes);
router.use("/v1/upload", uploadRoutes);

export default router;
