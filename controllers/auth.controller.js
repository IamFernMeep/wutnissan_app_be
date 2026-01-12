// controllers/auth.controller.js
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export async function login(req, res) {
    try {
        const { username, password } = req.body;
        const user = await User.findByUsername(username);

        if (!user || user.password !== password) {
            return res.status(401).json({
                code: 401,
                message: "Invalid username or password",
                data: []
            });
        }

        // สร้าง JWT พร้อม role
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            code: 200,
            message: "Login successful",
            data: {
                token,
                role: user.role,
                username: user.username
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, message: err.message, data: [] });
    }
}
