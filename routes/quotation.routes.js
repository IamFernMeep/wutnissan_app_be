import express from "express";
import {
    getListQuatation,
    getQuatationById,
    createQuatation,
    updateQuatation,
    deleteQuatation,
    getQuotationByCustomerId
} from "../controllers/quotation.controller.js";

const router = express.Router();

router.get("/", getListQuatation);
router.get("/:id", getQuatationById);
router.post("/", createQuatation);
router.patch("/:id", updateQuatation);
router.delete("/:id", deleteQuatation);
router.get('/customer/:customerId', getQuotationByCustomerId);

export default router;
