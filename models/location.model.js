// models/location.model.js
import connectDB from "../config/db.js";  // ต้องมีบรรทัดนี้

export const Location = {
    findAllProvinces: async () => {
        const conn = await connectDB();
        const [rows] = await conn.execute(
            `SELECT id, name_th, name_en, geography_id
       FROM provinces
       ORDER BY id`
        );
        return rows;
    },

    findDistrictsByProvince: async (provinceId) => {
        const conn = await connectDB();
        const [rows] = await conn.execute(
            `SELECT id, name_th, name_en, province_id
       FROM districts
       WHERE province_id = ?
       ORDER BY id`,
            [provinceId]
        );
        return rows;
    },

    findSubdistrictsByDistrict: async (districtId) => {
        const conn = await connectDB();
        const [rows] = await conn.execute(
            `SELECT id, name_th, name_en, zip_code, district_id
       FROM subdistricts
       WHERE district_id = ?
       ORDER BY id`,
            [districtId]
        );
        return rows;
    }
};
