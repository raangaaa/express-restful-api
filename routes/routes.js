import { Router } from "express";
import authRoutes from "./v1/authRoutes";


const router = Router();

router.use("/auth", authRoutes);


export default router;