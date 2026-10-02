// models/quotation_parts.model.js
import pool from "../config/db.js";

export const QuotationPart = {

    // =========================
    // Get Parts by Quotation ID
    // =========================
    findByQuotationId: async (quotationId, db = pool) => {
        const [rows] = await db.execute(
            `SELECT name, qty, unit, price, cost, total, note
             FROM quotation_parts
             WHERE quotation_id = ?`,
            [quotationId]
        );
        return rows;
    },

    // =========================
    // Create Part
    // =========================
    create: async (quotationId, part, db = pool) => {
        const qty = Number(part.qty ?? 1);
        const price = Number(part.price ?? 0);
        const cost = Number(part.cost ?? 0);
        const total = qty * price;

        await db.execute(
            `INSERT INTO quotation_parts
             (quotation_id, name, qty, unit, price, cost, total, note)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                quotationId,
                part.name,
                qty,
                part.unit ?? "ชิ้น",
                price,
                cost,
                total,
                part.note ?? ""
            ]
        );
    },


    // =========================
    // Delete Parts by Quotation ID
    // =========================
    deleteByQuotationId: async (quotationId, db = pool) => {
        await db.execute(
            `DELETE FROM quotation_parts
             WHERE quotation_id = ?`,
            [quotationId]
        );
    }
};
