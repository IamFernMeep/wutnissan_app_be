// controllers/quotation.controller.js
import { Quotation } from "../models/quotation.model.js";

// GET /api/v1/quotation
export async function getListQuatation(req, res) {
    try {
        const list = await Quotation.findAll();
        return res.status(200).json({ code: 200, message: "success", data: list });
    } catch (err) {
        return res.status(500).json({ code: 500, message: err.message, data: [] });
    }
}

// GET /api/v1/quotation/:id
export async function getQuatationById(req, res) {
    try {
        const item = await Quotation.findByIdOrBillNo(req.params.id);

        if (!item) {
            return res.status(404).json({ code: 404, message: "Quotation not found", data: null });
        }

        return res.status(200).json({ code: 200, message: "success", data: item });
    } catch (err) {
        return res.status(500).json({ code: 500, message: err.message, data: null });
    }
}

// POST /api/v1/quotation
export async function createQuatation(req, res) {
    try {
        const created = await Quotation.create(req.body);
        return res.status(201).json({ code: 201, message: "success", data: created });
    } catch (err) {
        const status = err.statusCode || 400;
        return res.status(status).json({ code: status, message: err.message, data: [] });
    }
}

// PATCH /api/v1/quotation/:id
export async function updateQuatation(req, res) {
    try {
        const updated = await Quotation.updateByIdOrBillNo(req.params.id, req.body);

        if (!updated) {
            return res.status(404).json({ code: 404, message: "Quotation not found", data: [] });
        }

        return res.status(200).json({ code: 200, message: "success", data: updated });
    } catch (err) {
        const status = err.statusCode || 400;
        return res.status(status).json({ code: status, message: err.message, data: [] });
    }
}

// DELETE /api/v1/quotation/:id
export async function deleteQuatation(req, res) {
    try {
        const ok = await Quotation.deleteByIdOrBillNo(req.params.id);

        if (!ok) {
            return res.status(404).json({ code: 404, message: "Quotation not found", data: [] });
        }

        return res.status(200).json({
            code: 200,
            message: "Quotation deleted successfully",
            data: { id: String(req.params.id) }
        });
    } catch (err) {
        return res.status(500).json({ code: 500, message: err.message, data: [] });
    }
}

// GET /api/v1/quotation/customer/:customerId
export async function getQuotationByCustomerId(req, res) {
    try {
        const list = await Quotation.findByCustomerId(req.params.customerId);

        return res.status(200).json({
            code: 200,
            message: "success",
            data: list
        });
    } catch (err) {
        return res.status(500).json({
            code: 500,
            message: err.message,
            data: []
        });
    }
}
