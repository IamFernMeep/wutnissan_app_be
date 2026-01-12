import express from "express";
import { login } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", (req, res, next) => {
    console.log("💡 Login route hit");
    next();
}, login);

export default router;
