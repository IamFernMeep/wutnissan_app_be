// controllers/appointment.controller.js
import { Appointment } from "../models/appointment.model.js";

const parseId = (value) => {
    const id = Number(value);
    return Number.isFinite(id) && id > 0 ? id : null;
};

// GET /api/v1/appointments
export async function getListAppointment(req, res) {
    try {
        const list = await Appointment.findAll();
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

// GET /api/v1/appointments/:id
export async function getAppointmentById(req, res) {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({
            code: 400,
            message: "Invalid appointment id",
            data: null
        });
    }

    try {
        const item = await Appointment.findById(id);
        if (!item) {
            return res.status(404).json({
                code: 404,
                message: "Appointment not found",
                data: null
            });
        }

        return res.status(200).json({
            code: 200,
            message: "success",
            data: item
        });
    } catch (err) {
        return res.status(500).json({
            code: 500,
            message: err.message,
            data: null
        });
    }
}

// POST /api/v1/appointments
export async function createAppointment(req, res) {
    try {
        const { name, phone, issue, deliveryDate } = req.body;

        // basic validation
        if (!name || !issue || !deliveryDate) {
            return res.status(400).json({
                code: 400,
                message: "name, issue and deliveryDate are required",
                data: null
            });
        }

        const created = await Appointment.create({ name, phone, issue, deliveryDate });

        return res.status(201).json({
            code: 201,
            message: "success",
            data: created
        });
    } catch (err) {
        const status = err.statusCode || 400;
        return res.status(status).json({
            code: status,
            message: err.message,
            data: null
        });
    }
}

// PATCH /api/v1/appointments/:id
export async function updateAppointment(req, res) {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({
            code: 400,
            message: "Invalid appointment id",
            data: null
        });
    }

    try {
        const updated = await Appointment.updateById(id, req.body);
        if (!updated) {
            return res.status(404).json({
                code: 404,
                message: "Appointment not found",
                data: null
            });
        }

        return res.status(200).json({
            code: 200,
            message: "success",
            data: updated
        });
    } catch (err) {
        const status = err.statusCode || 400;
        return res.status(status).json({
            code: status,
            message: err.message,
            data: null
        });
    }
}

// DELETE /api/v1/appointments/:id
export async function deleteAppointment(req, res) {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({
            code: 400,
            message: "Invalid appointment id",
            data: null
        });
    }

    try {
        const ok = await Appointment.deleteById(id);
        if (!ok) {
            return res.status(404).json({
                code: 404,
                message: "Appointment not found",
                data: null
            });
        }

        return res.status(200).json({
            code: 200,
            message: "Appointment deleted successfully",
            data: { id: String(id) }
        });
    } catch (err) {
        return res.status(500).json({
            code: 500,
            message: err.message,
            data: null
        });
    }
}
