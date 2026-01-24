// middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export default async function authMiddleware(req, res, next) {
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
}
