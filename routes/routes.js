import { Router } from "express";
import authRoutes from "./v1/authRoutes.js";


const router = Router();

router.use("/auth", authRoutes);


export default router;