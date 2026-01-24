// models/jobsheet_parts.model.js
import pool from "../config/db.js";

export const JobsheetParts = {

    // =========================
    // Find All By Jobsheet ID
    // =========================
    findAllByJobsheetId: async (jobsheetId) => {
        const [rows] = await pool.execute(
            `SELECT
            id AS _id,
            part_id,
            name,
            qty,
            unit,
            price,
            cost,
            total,
            note,
            created_at
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
            cost: p.cost,
            total: p.total,
            note: p.note,
            createdAt: new Date(p.created_at).toISOString()
        }));
    },


    // =========================
    // Create Parts (Transaction)
    // =========================
    create: async (partsArray = [], jobsheetId, conn = null) => {
        if (!Array.isArray(partsArray) || !partsArray.length) return;

        const connection = conn ?? await pool.getConnection();

        try {
            if (!conn) await connection.beginTransaction();

            for (const part of partsArray) {
                await connection.execute(
                    `INSERT INTO jobsheet_parts
                    (jobsheet_id, part_id, name, qty, unit, price, cost, total, note)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        jobsheetId,
                        part.partId ?? null,
                        part.name,
                        part.qty ?? 1,
                        part.unit ?? "ชิ้น",
                        part.price ?? 0,
                        part.cost ?? 0,   // ✅ เพิ่ม
                        (part.qty ?? 1) * (part.price ?? 0),
                        part.note ?? null
                    ]
                );
            }

            if (!conn) await connection.commit();
        } catch (err) {
            if (!conn) await connection.rollback();
            throw err;
        } finally {
            if (!conn) connection.release();
        }
    },

    // =========================
    // Delete By Jobsheet ID
    // =========================
    deleteByJobsheetId: async (jobsheetId, conn = null) => {
        const connection = conn ?? await pool.getConnection();

        try {
            if (!conn) await connection.beginTransaction();

            await connection.execute(
                `DELETE FROM jobsheet_parts WHERE jobsheet_id = ?`,
                [jobsheetId]
            );

            if (!conn) await connection.commit();
        } catch (err) {
            if (!conn) await connection.rollback();
            throw err;
        } finally {
            if (!conn) connection.release();
        }
    },

    // =========================
    // Update By Jobsheet ID (SAFE)
    // =========================
    updateByJobsheetId: async (partsArray = [], jobsheetId) => {
        const conn = await pool.getConnection();

        try {
            await conn.beginTransaction();

            await JobsheetParts.deleteByJobsheetId(jobsheetId, conn);
            await JobsheetParts.create(partsArray, jobsheetId, conn);

            await conn.commit();
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }
};
