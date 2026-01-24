// models/appointment.model.js
import pool from "../config/db.js";

// แปลง row DB เป็น DTO สำหรับ FE
function toAppointmentDTO(row) {
    return {
        _id: String(row.id),
        name: row.customer_name,
        phone: row.customer_phone,
        issue: row.issue,
        deliveryDate: row.delivery_date // format จาก DB "YYYY-MM-DD HH:mm:ss"
    };
}

// Helper แปลง MySQL DATETIME ให้ปลอดภัย
function formatDeliveryDate(input) {
    if (!input) return null;
    // ถ้าเป็น Date object -> format เป็น MySQL DATETIME
    if (input instanceof Date) {
        return input.toISOString().slice(0, 19).replace('T', ' ');
    }
    // ถ้าเป็น string "YYYY-MM-DD" หรือ "YYYY-MM-DDTHH:mm" -> "YYYY-MM-DD HH:mm:ss"
    return input.replace('T', ' ') + (input.length === 16 ? ':00' : '');
}

export const Appointment = {
    findAll: async () => {
        const [rows] = await pool.execute(
            `SELECT id, customer_name, customer_phone, issue, delivery_date
       FROM appointments
       ORDER BY delivery_date ASC, created_at DESC`
        );
        return rows.map(toAppointmentDTO);
    },

    findById: async (id) => {
        const [rows] = await pool.execute(
            `SELECT id, customer_name, customer_phone, issue, delivery_date
       FROM appointments
       WHERE id = ?
       LIMIT 1`,
            [id]
        );
        return rows.length ? toAppointmentDTO(rows[0]) : null;
    },

    create: async (data = {}) => {
        const payload = {
            name: data.name?.trim(),
            phone: data.phone ?? null,
            issue: data.issue?.trim(),
            deliveryDate: formatDeliveryDate(data.deliveryDate)
        };

        if (!payload.name) throw Object.assign(new Error("name is required"), { statusCode: 400 });
        if (!payload.issue) throw Object.assign(new Error("issue is required"), { statusCode: 400 });
        if (!payload.deliveryDate) throw Object.assign(new Error("deliveryDate is required"), { statusCode: 400 });

        const [result] = await pool.execute(
            `INSERT INTO appointments
       (customer_name, customer_phone, issue, delivery_date)
       VALUES (?, ?, ?, ?)`,
            [payload.name, payload.phone, payload.issue, payload.deliveryDate]
        );

        return Appointment.findById(result.insertId);
    },

    updateById: async (id, data = {}) => {
        const [rows] = await pool.execute(
            `SELECT customer_name, customer_phone, issue, delivery_date
       FROM appointments
       WHERE id = ?
       LIMIT 1`,
            [id]
        );
        if (!rows.length) return null;

        const current = rows[0];

        const nextName = data.name !== undefined ? String(data.name).trim() : current.customer_name;
        const nextPhone = data.phone !== undefined ? data.phone : current.customer_phone;
        const nextIssue = data.issue !== undefined ? String(data.issue).trim() : current.issue;
        const nextDeliveryDate =
            data.deliveryDate !== undefined
                ? formatDeliveryDate(data.deliveryDate)
                : current.delivery_date;

        if (!nextName) throw Object.assign(new Error("name is required"), { statusCode: 400 });
        if (!nextIssue) throw Object.assign(new Error("issue is required"), { statusCode: 400 });
        if (!nextDeliveryDate) throw Object.assign(new Error("deliveryDate is required"), { statusCode: 400 });

        await pool.execute(
            `UPDATE appointments
       SET customer_name = ?, customer_phone = ?, issue = ?, delivery_date = ?
       WHERE id = ?`,
            [nextName, nextPhone, nextIssue, nextDeliveryDate, id]
        );

        return Appointment.findById(id);
    },

    deleteById: async (id) => {
        const [result] = await pool.execute(
            `DELETE FROM appointments WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }
};

