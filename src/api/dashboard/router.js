import { Router } from "express";
import dashboardController from "./controller.js";

const router = Router();

router.get("/", dashboardController);

export default router;
