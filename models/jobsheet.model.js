// models/jobsheet.model.js
import connectDB from "../config/db.js";
import { Customer } from "./customer.model.js";
import { JobsheetParts } from "./jobsheet_parts.model.js";

// Helper แปลง row เป็น DTO สำหรับ list
async function toListDTO(row) {
    const customer = await Customer.findById(row.customer_id);
    const cars = customer?.car
        ? Array.isArray(customer.car) ? customer.car : [customer.car]
        : [];
    const car = cars.length === 1 ? cars[0] : cars;

    return {
        jobId: row.job_id,
        customer: customer?.name ?? row.customer_name,
        car,                       // { registration, model } หรือ array
        status: row.status,
        dueDate: row.due_date ? String(row.due_date) : null,
        total: row.final_total ?? 0
    };
}

// Helper แปลง row เป็น DTO สำหรับ detail
async function toDetailDTO(row) {
    const customer = await Customer.findById(row.customer_id);
    const cars = customer?.car
        ? Array.isArray(customer.car) ? customer.car : [customer.car]
        : [];
    const car = cars.length === 1 ? cars[0] : cars;

    // ดึง parts จาก jobsheet_parts table
    const parts = await JobsheetParts.findAllByJobsheetId(row.id);

    return {
        _id: String(row.id),
        jobId: row.job_id,
        name: customer?.name ?? row.customer_name,
        phone: customer?.phone ?? row.customer_phone,
        car,
        parts,
        allTotal: row.all_total ?? 0,
        costs: row.costs ?? 0,
        finalTotal: row.final_total ?? 0,
        pickupDateTime: row.pickup_datetime ?? null,
        createdAt: new Date(row.created_at).toISOString()
    };
}

export const Jobsheet = {
    // GET list
    findAll: async () => {
        const conn = await connectDB();
        const [rows] = await conn.execute(
            `SELECT id, job_id, customer_id, customer_name, status, due_date, final_total
             FROM jobsheets
             ORDER BY created_at DESC`
        );

        const data = [];
        for (const row of rows) {
            data.push(await toListDTO(row));
        }
        return data;
    },

    // GET by id หรือ jobId
    findByIdOrJobId: async (idOrJobId) => {
        const conn = await connectDB();

        const isNumberId = /^\d+$/.test(String(idOrJobId));
        const sql = isNumberId
            ? `SELECT * FROM jobsheets WHERE id = ? LIMIT 1`
            : `SELECT * FROM jobsheets WHERE job_id = ? LIMIT 1`;

        const [rows] = await conn.execute(sql, [idOrJobId]);
        if (!rows.length) return null;

        return await toDetailDTO(rows[0]);
    },

    // CREATE
    create: async (data = {}) => {
        const conn = await connectDB();

        if (!data.jobId) throw Object.assign(new Error("jobId is required"), { statusCode: 400 });
        if (!data.customerId) throw Object.assign(new Error("customerId is required"), { statusCode: 400 });

        // fetch customer info
        const customer = await Customer.findById(data.customerId);
        if (!customer) throw Object.assign(new Error("Customer not found"), { statusCode: 404 });

        const payload = {
            jobId: data.jobId.trim(),
            customerId: data.customerId,
            customerName: customer.name,
            customerPhone: customer.phone ?? null,
            allTotal: Number(data.allTotal ?? 0),
            costs: Number(data.costs ?? 0),
            finalTotal: Number(data.finalTotal ?? 0),
            status: data.status ?? "กำลังดำเนินการ",
            dueDate: data.dueDate ?? null,
            pickupDateTime: data.pickupDateTime ?? null
        };

        const [result] = await conn.execute(
            `INSERT INTO jobsheets
             (job_id, customer_id, customer_name, customer_phone, all_total, costs, final_total, status, due_date, pickup_datetime)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                payload.jobId,
                payload.customerId,
                payload.customerName,
                payload.customerPhone,
                payload.allTotal,
                payload.costs,
                payload.finalTotal,
                payload.status,
                payload.dueDate,
                payload.pickupDateTime
            ]
        );

        const jobsheetId = result.insertId;

        // insert parts ถ้ามี
        if (Array.isArray(data.parts) && data.parts.length) {
            await JobsheetParts.create(data.parts, jobsheetId);
        }

        return await Jobsheet.findByIdOrJobId(payload.jobId);
    },

    // UPDATE
    updateByIdOrJobId: async (idOrJobId, data = {}) => {
        const conn = await connectDB();
        const current = await Jobsheet.findByIdOrJobId(idOrJobId);
        if (!current) return null;

        // update jobsheet info
        await conn.execute(
            `UPDATE jobsheets
             SET all_total = ?, costs = ?, final_total = ?,
                 pickup_datetime = ?, status = COALESCE(?, status), due_date = COALESCE(?, due_date)
             WHERE ${/^\d+$/.test(String(idOrJobId)) ? "id = ?" : "job_id = ?"}`,
            [
                data.allTotal ?? current.allTotal,
                data.costs ?? current.costs,
                data.finalTotal ?? current.finalTotal,
                data.pickupDateTime ?? current.pickupDateTime,
                data.status ?? null,
                data.dueDate ?? null,
                idOrJobId
            ]
        );

        // update parts ถ้ามี
        if (Array.isArray(data.parts)) {
            const jobsheetId = /^\d+$/.test(String(idOrJobId)) ? Number(idOrJobId) : current._id;
            await JobsheetParts.updateByJobsheetId(data.parts, jobsheetId);
        }

        return await Jobsheet.findByIdOrJobId(idOrJobId);
    },

    // DELETE
    deleteByIdOrJobId: async (idOrJobId) => {
        const conn = await connectDB();
        const isNumberId = /^\d+$/.test(String(idOrJobId));
        const where = isNumberId ? "id = ?" : "job_id = ?";

        const [result] = await conn.execute(`DELETE FROM jobsheets WHERE ${where}`, [idOrJobId]);
        return result.affectedRows > 0;
    }
};
