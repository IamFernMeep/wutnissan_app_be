import pool from "../config/db.js";
import { Customer } from "./customer.model.js";
import { JobsheetParts } from "./jobsheet_parts.model.js";

async function generateJobId(conn) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}${mm}${dd}`;
    const today = `${yyyy}-${mm}-${dd}`;

    const [rows] = await conn.execute(
        `SELECT last_seq FROM job_sequences
         WHERE seq_date = ? FOR UPDATE`,
        [today]
    );

    let nextSeq = 1;

    if (rows.length === 0) {
        await conn.execute(
            `INSERT INTO job_sequences (seq_date, last_seq)
             VALUES (?, ?)`,
            [today, 1]
        );
    } else {
        nextSeq = rows[0].last_seq + 1;
        await conn.execute(
            `UPDATE job_sequences
             SET last_seq = ?
             WHERE seq_date = ?`,
            [nextSeq, today]
        );
    }

    return `JOB-${dateStr}-${String(nextSeq).padStart(3, "0")}`;
}


// =========================
// Helper: DTO (List)
// =========================
async function toListDTO(row) {
    const customer = await Customer.findById(row.customer_id);

    const cars = customer?.car
        ? Array.isArray(customer.car)
            ? customer.car
            : [customer.car]
        : [];

    return {
        jobId: row.job_id,
        customer: customer?.name ?? row.customer_name,
        car: cars.length === 1 ? cars[0] : cars,
        status: row.status,
        dueDate: row.pickup_datetime
            ? new Date(row.pickup_datetime).toISOString()
            : row.due_date
                ? new Date(row.due_date).toISOString()
                : null,
        total: row.final_total ?? 0
    };
}

// =========================
// Helper: DTO (Detail)
// =========================
async function toDetailDTO(row) {
    const customer = await Customer.findById(row.customer_id);
    const parts = await JobsheetParts.findAllByJobsheetId(row.id);

    const cars = customer?.car
        ? Array.isArray(customer.car)
            ? customer.car
            : [customer.car]
        : [];

    return {
        _id: String(row.id),
        jobId: row.job_id,
        name: customer?.name ?? row.customer_name,
        phone: customer?.phone ?? row.customer_phone,
        car: cars.length === 1 ? cars[0] : cars,
        parts,
        allTotal: row.all_total ?? 0,
        costs: row.costs ?? 0,
        finalTotal: row.final_total ?? 0,
        pickupDateTime: row.pickup_datetime ?? null,
        createdAt: new Date(row.created_at).toISOString()
    };
}

// =========================
// Jobsheet Model
// =========================
export const Jobsheet = {

    // =========================
    // Get All Jobsheets
    // =========================
    findAll: async () => {
        const [rows] = await pool.execute(
            `SELECT id, job_id, customer_id, customer_name,
                    status, due_date, pickup_datetime, final_total
             FROM jobsheets
             ORDER BY created_at DESC`
        );

        const result = [];
        for (const row of rows) {
            result.push(await toListDTO(row));
        }
        return result;
    },

    // =========================
    // Get By ID or Job ID
    // =========================
    findByIdOrJobId: async (idOrJobId) => {
        const isNumber = /^\d+$/.test(String(idOrJobId));
        const sql = isNumber
            ? `SELECT * FROM jobsheets WHERE id = ? LIMIT 1`
            : `SELECT * FROM jobsheets WHERE job_id = ? LIMIT 1`;

        const [rows] = await pool.execute(sql, [idOrJobId]);
        if (!rows.length) return null;

        return toDetailDTO(rows[0]);
    },

    // =========================
    // Create Jobsheet (FAST + SAFE)
    // =========================
    create: async (data = {}) => {
        if (!data.customerId) {
            throw Object.assign(
                new Error("customerId is required"),
                { statusCode: 400 }
            );
        }

        const customer = await Customer.findById(data.customerId);
        if (!customer) {
            throw Object.assign(
                new Error("Customer not found"),
                { statusCode: 404 }
            );
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // ✅ สำคัญมาก: ส่ง conn เข้าไป
            const jobId = await generateJobId(conn);

            const payload = {
                jobId,
                customerId: data.customerId,
                customerName: customer.name,
                customerPhone: customer.phone ?? null,
                allTotal: Number(data.allTotal ?? 0),
                costs: Number(data.costs ?? 0),
                finalTotal: Number(data.finalTotal ?? 0),
                status: data.status ?? "รอดำเนินการ",
                dueDate: data.dueDate ?? null,
                pickupDateTime: data.pickupDateTime ?? null
            };

            const [result] = await conn.execute(
                `INSERT INTO jobsheets
             (job_id, customer_id, customer_name, customer_phone,
              all_total, costs, final_total, status, due_date, pickup_datetime)
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

            let parts = [];
            if (Array.isArray(data.parts) && data.parts.length) {
                await JobsheetParts.create(data.parts, jobsheetId, conn);
                parts = data.parts;
            }

            await conn.commit();

            return {
                _id: String(jobsheetId),
                jobId: payload.jobId,
                name: customer.name,
                phone: customer.phone ?? null,
                car: customer.car ?? null,
                parts,
                allTotal: payload.allTotal,
                costs: payload.costs,
                finalTotal: payload.finalTotal,
                pickupDateTime: payload.pickupDateTime,
                createdAt: new Date().toISOString()
            };

        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    },

    // =========================
    // Update Jobsheet (Full)
    // =========================
    updateByIdOrJobId: async (idOrJobId, data = {}) => {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const current = await Jobsheet.findByIdOrJobId(idOrJobId);
            if (!current) return null;

            const isNumber = /^\d+$/.test(String(idOrJobId));

            await conn.execute(
                `UPDATE jobsheets
                 SET all_total = ?,
                     costs = ?,
                     final_total = ?,
                     pickup_datetime = ?,
                     status = COALESCE(?, status),
                     due_date = COALESCE(?, due_date)
                 WHERE ${isNumber ? "id = ?" : "job_id = ?"}`,
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

            if (Array.isArray(data.parts)) {
                const jobsheetId = isNumber
                    ? Number(idOrJobId)
                    : Number(current._id);
                await JobsheetParts.updateByJobsheetId(data.parts, jobsheetId, conn);
            }

            await conn.commit();
            return Jobsheet.findByIdOrJobId(idOrJobId);

        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    },

    // =========================
    // Update Status Only
    // =========================
    updateStatusByIdOrJobId: async (idOrJobId, status) => {
        if (!status) {
            throw Object.assign(new Error("status is required"), { statusCode: 400 });
        }

        const isNumber = /^\d+$/.test(String(idOrJobId));

        const [result] = await pool.execute(
            `UPDATE jobsheets
             SET status = ?
             WHERE ${isNumber ? "id = ?" : "job_id = ?"}`,
            [status, idOrJobId]
        );

        if (result.affectedRows === 0) return null;
        return Jobsheet.findByIdOrJobId(idOrJobId);
    },

    // =========================
    // Delete
    // =========================
    deleteByIdOrJobId: async (idOrJobId) => {
        const isNumber = /^\d+$/.test(String(idOrJobId));

        const [result] = await pool.execute(
            `DELETE FROM jobsheets
             WHERE ${isNumber ? "id = ?" : "job_id = ?"}`,
            [idOrJobId]
        );

        return result.affectedRows > 0;
    }
};
