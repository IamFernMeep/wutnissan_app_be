// models/car.model.js
import pool from "../config/db.js";

export const Car = {

    // ✅ ใช้ตอนเลือกรถจากลูกค้า
    findByCustomerId: async (customerId) => {
        const [rows] = await pool.execute(
            `SELECT
                id,
                registration,
                model,
                color,
                chassis_number,
                mileage
             FROM cars
             WHERE customer_id = ?`,
            [customerId]
        );

        return rows.map(r => ({
            id: r.id,
            registration: r.registration,
            model: r.model,
            color: r.color,
            chassisNumber: r.chassis_number,
            mileage: r.mileage
        }));
    },

    // ✅ ใช้ตอนโหลด quotation / jobsheet
    findById: async (carId) => {
        const [rows] = await pool.execute(
            `SELECT
                id,
                registration,
                model,
                color,
                chassis_number,
                mileage
             FROM cars
             WHERE id = ?
             LIMIT 1`,
            [carId]
        );

        if (!rows.length) return null;

        const r = rows[0];
        return {
            id: r.id,
            registration: r.registration,
            model: r.model,
            color: r.color,
            chassisNumber: r.chassis_number,
            mileage: r.mileage
        };
    }
};
