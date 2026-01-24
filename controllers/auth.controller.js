// controllers/auth.controller.js
import pool from "../config/db.js";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await pool.query(
            `
      SELECT id, username, password_hash, role, is_active
      FROM users
      WHERE username = ?
      LIMIT 1
      `,
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = rows[0];

        // ❌ user ถูก disable
        if (user.is_active !== 1) {
            return res.status(403).json({ message: "User is inactive" });
        }

        // ✅ เปรียบเทียบกับ password_hash ตรง ๆ
        if (password !== user.password_hash) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
