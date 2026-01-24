// models/location.model.js
import pool from "../config/db.js";

export const Location = {

    // =========================
    // Provinces
    // =========================
    findAllProvinces: async () => {
        const [rows] = await pool.execute(
            `SELECT id, name_th, name_en, geography_id
             FROM provinces
             ORDER BY id`
        );
        return rows;
    },

    // =========================
    // Districts by Province
    // =========================
    findDistrictsByProvince: async (provinceId) => {
        const [rows] = await pool.execute(
            `SELECT id, name_th, name_en, province_id
             FROM districts
             WHERE province_id = ?
             ORDER BY id`,
            [provinceId]
        );
        return rows;
    },

    // =========================
    // Subdistricts by District
    // =========================
    findSubdistrictsByDistrict: async (districtId) => {
        const [rows] = await pool.execute(
            `SELECT id, name_th, name_en, zip_code, district_id
             FROM subdistricts
             WHERE district_id = ?
             ORDER BY id`,
            [districtId]
        );
        return rows;
    }
};
