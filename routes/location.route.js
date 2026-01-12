// routes/location.route.js
import { Router } from "express";
import {
    getProvinces,
    getDistricts,
    getSubdistricts
} from "../controllers/location.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// GET /api/v1/provinces
router.get("/provinces", authMiddleware, getProvinces);

// GET /api/v1/districts?province_id=10
router.get("/districts", authMiddleware, getDistricts);

// GET /api/v1/subdistricts?district_id=1001
router.get("/subdistricts", authMiddleware, getSubdistricts);

export default router;
