import pool from "../config/db.js";

export const User = {
    findByUsername: async (username) => {
        const [rows] = await pool.execute(
            `SELECT * FROM users WHERE username = ? AND is_active = 1 LIMIT 1`,
            [username]
        );
        return rows[0] || null;
    },

    findById: async (id) => {
        const [rows] = await pool.execute(
            `SELECT id, username, role FROM users WHERE id = ? AND is_active = 1`,
            [id]
        );
        return rows[0] || null;
    }
};
