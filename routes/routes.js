import { Router } from "express";
import authRoutes from "~/routes/v1/authRoutes";


const router = Router();

router.use("/auth", authRoutes);


export default router;