import express from "express";
import {
    getListJobsheet,
    getJobsheetById,
    createJobsheet,
    updateJobsheet,
    deleteJobsheet,
    updateJobsheetStatus
} from "../controllers/jobsheet.controller.js";

const router = express.Router();

router.get("/", getListJobsheet);
router.get("/:id", getJobsheetById);
router.post("/", createJobsheet);
router.patch("/:id/status", updateJobsheetStatus);
router.patch("/:id", updateJobsheet);
router.delete("/:id", deleteJobsheet);

export default router;
