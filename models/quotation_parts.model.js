// models/quotation_parts.model.js
import connectDB from "../config/db.js";

export const QuotationPart = {
    findByQuotationId: async (quotationId) => {
        const conn = await connectDB();
        const [rows] = await conn.execute(
            `SELECT name, qty, unit, price, total, note 
             FROM quotation_parts 
             WHERE quotation_id = ?`,
            [quotationId]
        );
        return rows;
    },

    create: async (quotationId, part) => {
        const conn = await connectDB();
        const total = (part.qty ?? 1) * (part.price ?? 0);
        await conn.execute(
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

    deleteByQuotationId: async (quotationId) => {
        const conn = await connectDB();
        await conn.execute(
            `DELETE FROM quotation_parts WHERE quotation_id = ?`,
            [quotationId]
        );
    }
};
