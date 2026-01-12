// models/user.model.js
import connectDB from "../config/db.js";

export const User = {
    findByUsername: async (username) => {
        const conn = await connectDB();
        const [rows] = await conn.execute(
            `SELECT * FROM users WHERE username = ?`,
            [username]
        );
        console.log("DB query result:", rows);
        return rows[0];
    },

    create: async ({ username, password, role = "guest" }) => {
        const conn = await connectDB();
        const [result] = await conn.execute(
            `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
            [username, password, role]
        );
        return { id: result.insertId, username, role };
    }
};
