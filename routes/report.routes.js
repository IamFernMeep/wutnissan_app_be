// src/routes/report.routes.js
import express from "express";
import { ReportController } from "../controllers/report.controller.js";

const router = express.Router();

// Dashboard
router.get("/dashboard", ReportController.dashboard);

export default router;
