// controllers/location.controller.js
import { Location } from "../models/location.model.js";

// GET /api/v1/provinces
export async function getProvinces(req, res) {
    try {
        const data = await Location.findAllProvinces();
        res.status(200).json({
            code: 200,
            message: "success",
            data
        });
    } catch (err) {
        res.status(500).json({
            code: 500,
            message: err.message,
            data: []
        });
    }
}

// GET /api/v1/districts?province_id=10
export async function getDistricts(req, res) {
    try {
        const { province_id } = req.query;

        if (!province_id) {
            return res.status(400).json({
                code: 400,
                message: "province_id is required",
                data: []
            });
        }

        const data = await Location.findDistrictsByProvince(province_id);
        res.status(200).json({
            code: 200,
            message: "success",
            data
        });
    } catch (err) {
        res.status(500).json({
            code: 500,
            message: err.message,
            data: []
        });
    }
}

// GET /api/v1/subdistricts?district_id=1001
export async function getSubdistricts(req, res) {
    try {
        const { district_id } = req.query;

        if (!district_id) {
            return res.status(400).json({
                code: 400,
                message: "district_id is required",
                data: []
            });
        }

        const data = await Location.findSubdistrictsByDistrict(district_id);
        res.status(200).json({
            code: 200,
            message: "success",
            data
        });
    } catch (err) {
        res.status(500).json({
            code: 500,
            message: err.message,
            data: []
        });
    }
}
