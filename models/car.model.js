// models/car.model.js
import pool from "../config/db.js";

export const Car = {
    findByCustomerId: async (customerId) => {
        const [rows] = await pool.execute(
            `SELECT id, registration, model
             FROM cars
             WHERE customer_id = ?`,
            [customerId]
        );
        return rows;
    }
};
