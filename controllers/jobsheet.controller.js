// controllers/jobsheet.controller.js
import { Jobsheet } from "../models/jobsheet.model.js";

// GET /api/v1/jobsheets
export async function getListJobsheet(req, res) {
    try {
        const list = await Jobsheet.findAll();
        return res.status(200).json({ code: 200, message: "success", data: list });
    } catch (err) {
        return res.status(500).json({ code: 500, message: err.message, data: [] });
    }
}

// GET /api/v1/jobsheets/:id  (รับได้ทั้ง id ตัวเลข หรือ jobId เช่น WO-1024)
export async function getJobsheetById(req, res) {
    try {
        const item = await Jobsheet.findByIdOrJobId(req.params.id);

        if (!item) {
            return res.status(404).json({ code: 404, message: "Jobsheet not found", data: [] });
        }

        return res.status(200).json({ code: 200, message: "success", data: [item] });
    } catch (err) {
        return res.status(500).json({ code: 500, message: err.message, data: [] });
    }
}

// POST /api/v1/jobsheets
export async function createJobsheet(req, res) {
    try {
        const created = await Jobsheet.create(req.body);
        return res.status(201).json({ code: 201, message: "success", data: created });
    } catch (err) {
        const status = err.statusCode || 400;
        return res.status(status).json({ code: status, message: err.message, data: [] });
    }
}

// PATCH /api/v1/jobsheets/:id
export async function updateJobsheet(req, res) {
    try {
        const updated = await Jobsheet.updateByIdOrJobId(req.params.id, req.body);

        if (!updated) {
            return res.status(404).json({ code: 404, message: "Jobsheet not found", data: [] });
        }

        return res.status(200).json({ code: 200, message: "success", data: updated });
    } catch (err) {
        const status = err.statusCode || 400;
        return res.status(status).json({ code: status, message: err.message, data: [] });
    }
}

// DELETE /api/v1/jobsheets/:id
export async function deleteJobsheet(req, res) {
    try {
        const ok = await Jobsheet.deleteByIdOrJobId(req.params.id);

        if (!ok) {
            return res.status(404).json({ code: 404, message: "Jobsheet not found", data: [] });
        }

        return res.status(200).json({
            code: 200,
            message: "Jobsheet deleted successfully",
            data: { id: String(req.params.id) }
        });
    } catch (err) {
        return res.status(500).json({ code: 500, message: err.message, data: [] });
    }
}
