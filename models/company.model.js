// models/company.model.js
import connectDB from '../config/db.js';

export const Company = {

    // =========================
    // Get Company (Singleton)
    // =========================
    findOne: async () => {
        const conn = await connectDB();

        const [rows] = await conn.execute(`
      SELECT
        id,
        name,
        address_detail AS addressDetail,
        province,
        district,
        subdistrict,
        postal_code AS postalCode,
        phone1,
        phone2,
        tax_id,
        logo_url,
        email,
        fax
      FROM company
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
        const conn = await connectDB();

        const [result] = await conn.execute(
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
