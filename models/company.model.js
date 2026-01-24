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
            LEFT JOIN provinces p 
                ON TRIM(p.name_th) = TRIM(c.province)
            LEFT JOIN districts d 
                ON TRIM(d.name_th) = TRIM(c.district)
            LEFT JOIN subdistricts s 
                ON TRIM(s.name_th) = TRIM(c.subdistrict)
            ORDER BY c.id ASC
            LIMIT 1
        `);

        if (!rows.length) return null;

        const row = rows[0];

        return {
            id: row.id,
            name: row.name,
            phone1: row.phone1,
            phone2: row.phone2,
            tax_id: row.tax_id,
            logo_url: row.logo_url,
            email: row.email,
            fax: row.fax,
            address: {
                address: row.addressDetail,
                province: row.province,
                district: row.district,
                subdistrict: row.subdistrict,
                postalCode: row.postalCode
            }
        };
    },

    // =========================
    // Update Company (Singleton)
    // =========================
    updateSingleton: async (data) => {
        const [result] = await pool.execute(
            `
            UPDATE company
            SET
                name = ?,
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
            WHERE id = 1
            `,
            [
                data.name ?? null,
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
