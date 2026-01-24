// models/company.model.js
import pool from "../config/db.js";

export const Company = {

    // =========================
    // Get Company (Singleton)
    // =========================
    findOne: async () => {
        const [rows] = await pool.execute(`
            SELECT
                c.id,
                c.name,
                c.address_detail AS addressDetail,
                p.name_th AS province,
                d.name_th AS district,
                s.name_th AS subdistrict,
                c.postal_code AS postalCode,
                c.phone1,
                c.phone2,
                c.tax_id,
                c.logo_url,
                c.email,
                c.fax
            FROM company c
            LEFT JOIN provinces p ON p.name_en = c.province
            LEFT JOIN districts d ON d.name_en = c.district
            LEFT JOIN subdistricts s ON s.name_en = c.subdistrict
            LIMIT 1
        `);

        if (!rows.length) return null;

        const row = rows[0];

        const {
            addressDetail,
            province,
            district,
            subdistrict,
            postalCode,
            ...company
        } = row;

        return {
            ...company,
            address: {
                address: addressDetail,
                province,
                district,
                subdistrict,
                postalCode
            }
        };
    },

    // =========================
    // Update Company (Singleton)
    // =========================
    updateSingleton: async (data) => {
        const [result] = await pool.execute(
            `UPDATE company
             SET name = ?,
                 address_detail = ?,
                 province = ?,
                 district = ?,
                 subdistrict = ?,
                 postal_code = ?,
                 phone1 = ?,
                 phone2 = ?,
                 tax_id = ?,
                 logo_url = ?,
                 email = ?,
                 fax = ?
             WHERE id = 1`,
            [
                data.name,
                data.address?.address ?? null,
                data.address?.province ?? null,
                data.address?.district ?? null,
                data.address?.subdistrict ?? null,
                data.address?.postalCode ?? null,
                data.phone1 ?? null,
                data.phone2 ?? null,
                data.tax_id ?? null,
                data.logo_url ?? null,
                data.email ?? null,
                data.fax ?? null
            ]
        );

        return result;
    }
};
