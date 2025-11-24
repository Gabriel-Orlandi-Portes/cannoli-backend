import { Router } from "express";
import { predictRevenue, detectAnomalies } from "./ml.controller.js";

const router = Router();

router.get("/predict-revenue", predictRevenue);
router.get("/anomalies", detectAnomalies);

export default router;
