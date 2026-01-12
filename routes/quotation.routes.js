import express from "express";
import {
    getListQuatation,
    getQuatationById,
    createQuatation,
    updateQuatation,
    deleteQuatation
} from "../controllers/quotation.controller.js";

const router = express.Router();

router.get("/", getListQuatation);
router.get("/:id", getQuatationById);
router.post("/", createQuatation);
router.patch("/:id", updateQuatation);
router.delete("/:id", deleteQuatation);

export default router;
