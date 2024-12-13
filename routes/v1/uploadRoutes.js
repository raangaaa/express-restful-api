import { Router } from "express";
import control from "../../src/utils/control.js";

const router = Router();

router.post("/aws", control());
router.post("/gcs", control());
router.post("/public", control());

export default router;
