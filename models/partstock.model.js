// models/partstock.model.js
import pool from "../config/db.js";

export const PartStock = {

    // =========================
    // Get All Parts
    // =========================
    findAll: async () => {
        const [parts] = await pool.execute(
            `SELECT 
                id AS _id,
                part_code,
                item_name AS name,
                cost_price AS cost,
                selling_price AS price,
                stock_quantity,
                unit,
                created_at AS createdAt,
                updated_at AS updatedAt
             FROM partstock
             ORDER BY id ASC`
        );
        return parts;
    },

    // =========================
    // Get By ID
    // =========================
    findById: async (id) => {
        const [parts] = await pool.execute(
            `SELECT 
                id AS _id,
                part_code,
                item_name AS name,
                cost_price AS cost,
                selling_price AS price,
                stock_quantity,
                unit,
                created_at AS createdAt,
                updated_at AS updatedAt
             FROM partstock
             WHERE id = ?
             LIMIT 1`,
            [id]
        );
        return parts.length ? parts[0] : null;
    },

    // =========================
    // Create Part
    // =========================
    create: async (data = {}) => {

        if (!data.name || data.price == null) {
            const err = new Error("name and price are required");
            err.statusCode = 400;
            throw err;
        }

        const cost = data.cost ?? 0;

        // 1️⃣ insert ก่อน (ยังไม่รู้ code)
        const [result] = await pool.execute(
            `INSERT INTO partstock
         (part_code, item_name, cost_price, selling_price, stock_quantity, unit, created_at)
         VALUES ('TEMP', ?, ?, ?, ?, ?, NOW())`,
            [
                data.name,
                cost,
                data.price,
                data.stock_quantity ?? 0,
                data.unit ?? null
            ]
        );

        // 2️⃣ gen ps-XXX จาก id
        const partCode = `ps-${String(result.insertId).padStart(3, "0")}`;

        // 3️⃣ update code
        await pool.execute(
            `UPDATE partstock SET part_code = ? WHERE id = ?`,
            [partCode, result.insertId]
        );

        return PartStock.findById(result.insertId);
    },

    // =========================
    // Update Part
    // =========================
    updateById: async (id, data = {}) => {
        const [rows] = await pool.execute(
            `SELECT * FROM partstock WHERE id = ?`,
            [id]
        );

        if (!rows.length) return null;

        const current = rows[0];

        await pool.execute(
            `UPDATE partstock 
             SET part_code = ?, 
                 item_name = ?, 
                 cost_price = ?, 
                 selling_price = ?, 
                 stock_quantity = ?, 
                 unit = ?, 
                 updated_at = NOW()
             WHERE id = ?`,
            [
                data.part_code ?? current.part_code,
                data.name ?? current.item_name,
                data.cost ?? current.cost_price,
                data.price ?? current.selling_price,
                data.stock_quantity ?? current.stock_quantity,
                data.unit ?? current.unit,
                id
            ]
        );

        return PartStock.findById(id);
    },

    // =========================
    // Delete Part
    // =========================
    deleteById: async (id) => {
        const [result] = await pool.execute(
            `DELETE FROM partstock WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }
};
