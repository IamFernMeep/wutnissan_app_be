import express from "express";
import {
    getListAppointment,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    deleteAppointment
} from "../controllers/appointment.controller.js";

const router = express.Router();

router.get("/", getListAppointment);
router.get("/:id", getAppointmentById);
router.post("/", createAppointment);
router.patch("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

export default router;
