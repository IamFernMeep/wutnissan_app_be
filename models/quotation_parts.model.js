// models/quotation_parts.model.js
import pool from "../config/db.js";

export const QuotationPart = {

    // =========================
    // Get Parts by Quotation ID
    // =========================
    findByQuotationId: async (quotationId) => {
        const [rows] = await pool.execute(
            `SELECT name, qty, unit, price, total, note
             FROM quotation_parts
             WHERE quotation_id = ?`,
            [quotationId]
        );
        return rows;
    },

    // =========================
    // Create Part
    // =========================
    create: async (quotationId, part) => {
        const total = (part.qty ?? 1) * (part.price ?? 0);

        await pool.execute(
            `INSERT INTO quotation_parts
             (quotation_id, name, qty, unit, price, total, note)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                quotationId,
                part.name,
                part.qty ?? 1,
                part.unit ?? "ชิ้น",
                part.price ?? 0,
                total,
                part.note ?? ""
            ]
        );
    },

    // =========================
    // Delete Parts by Quotation ID
    // =========================
    deleteByQuotationId: async (quotationId) => {
        await pool.execute(
            `DELETE FROM quotation_parts WHERE quotation_id = ?`,
            [quotationId]
        );
    }
};
