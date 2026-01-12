// models/jobsheet_parts.model.js
import connectDB from "../config/db.js";

export const JobsheetParts = {
    findAllByJobsheetId: async (jobsheetId) => {
        const conn = await connectDB();
        const [rows] = await conn.execute(
            `SELECT id AS _id, part_id, name, qty, unit, price, total, note, created_at
       FROM jobsheet_parts
       WHERE jobsheet_id = ?`,
            [jobsheetId]
        );
        return rows.map(p => ({
            _id: p._id,
            partId: p.part_id,
            name: p.name,
            qty: p.qty,
            unit: p.unit,
            price: p.price,
            total: p.total,
            note: p.note,
            createdAt: new Date(p.created_at).toISOString()
        }));
    },

    create: async (partsArray, jobsheetId) => {
        if (!Array.isArray(partsArray) || !partsArray.length) return;
        const conn = await connectDB();
        for (const part of partsArray) {
            await conn.execute(
                `INSERT INTO jobsheet_parts
         (jobsheet_id, part_id, name, qty, unit, price, total, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    jobsheetId,
                    part.partId ?? null,
                    part.name,
                    part.qty ?? 1,
                    part.unit ?? "ชิ้น",
                    part.price ?? 0,
                    (part.qty ?? 1) * (part.price ?? 0),
                    part.note ?? null
                ]
            );
        }
    },

    deleteByJobsheetId: async (jobsheetId) => {
        const conn = await connectDB();
        await conn.execute(`DELETE FROM jobsheet_parts WHERE jobsheet_id = ?`, [jobsheetId]);
    },

    updateByJobsheetId: async (partsArray, jobsheetId) => {
        // ลบแล้ว insert ใหม่
        await JobsheetParts.deleteByJobsheetId(jobsheetId);
        await JobsheetParts.create(partsArray, jobsheetId);
    }
};
