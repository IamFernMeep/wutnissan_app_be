import connectDB from "../config/db.js";

export const Car = {
    findByCustomerId: async (customerId) => {
        const conn = await connectDB();
        const [rows] = await conn.execute(
            `SELECT id, registration, model FROM cars WHERE customer_id = ?`,
            [customerId]
        );
        return rows;
    }
};
