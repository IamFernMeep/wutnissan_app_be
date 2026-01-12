import { PartStock } from "../models/partstock.model.js";

const parseId = (value) => {
    const id = Number(value);
    return Number.isFinite(id) && id > 0 ? id : null;
};

export async function getListParts(req, res) {
    try {
        const parts = await PartStock.findAll();
        return res.status(200).json({ code: 200, message: "success", data: parts });
    } catch (err) {
        return res.status(500).json({ code: 500, message: err.message, data: [] });
    }
}

export async function getPartById(req, res) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ code: 400, message: "Invalid part id", data: null });

    try {
        const part = await PartStock.findById(id);
        if (!part) return res.status(404).json({ code: 404, message: "Part not found", data: null });

        return res.status(200).json({ code: 200, message: "success", data: part });
    } catch (err) {
        return res.status(500).json({ code: 500, message: err.message, data: null });
    }
}

export async function createPart(req, res) {
    try {
        const newPart = await PartStock.create(req.body);
        return res.status(201).json({ code: 201, message: "success", data: newPart });
    } catch (err) {
        const status = err.statusCode || 400;
        return res.status(status).json({ code: status, message: err.message, data: [] });
    }
}

export async function updatePart(req, res) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ code: 400, message: "Invalid part id", data: [] });

    try {
        const updatedPart = await PartStock.updateById(id, req.body);
        if (!updatedPart) return res.status(404).json({ code: 404, message: "Part not found", data: [] });

        return res.status(200).json({ code: 200, message: "success", data: updatedPart });
    } catch (err) {
        const status = err.statusCode || 400;
        return res.status(status).json({ code: status, message: err.message, data: [] });
    }
}

export async function deletePart(req, res) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ code: 400, message: "Invalid part id", data: [] });

    try {
        const ok = await PartStock.deleteById(id);
        if (!ok) return res.status(404).json({ code: 404, message: "Part not found", data: [] });

        return res.status(200).json({ code: 200, message: "Part deleted successfully", data: { id: String(id) } });
    } catch (err) {
        return res.status(500).json({ code: 500, message: err.message, data: [] });
    }
}
