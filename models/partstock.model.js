import connectDB from "../config/db.js";

export const PartStock = {
    findAll: async () => {
        const conn = await connectDB();
        const [parts] = await conn.execute(`
      SELECT 
        id AS _id,
        part_code,
        item_name AS name,
        cost_price AS cost,
        selling_price AS price,
        stock_quantity,
        unit,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM partstock
      ORDER BY id ASC
    `);

        return parts;
    },

    findById: async (id) => {
        const conn = await connectDB();
        const [parts] = await conn.execute(
            `SELECT 
         id AS _id,
         part_code,
         item_name AS name,
         cost_price AS cost,
         selling_price AS price,
         stock_quantity,
         unit,
         created_at AS createdAt,
         updated_at AS updatedAt
       FROM partstock
       WHERE id = ?
       LIMIT 1`,
            [id]
        );

        return parts.length ? parts[0] : null;
    },

    create: async (data = {}) => {
        const conn = await connectDB();

        if (!data.part_code || !data.name || data.cost == null || data.price == null) {
            const err = new Error("part_code, name, cost, and price are required");
            err.statusCode = 400;
            throw err;
        }

        const [result] = await conn.execute(
            `INSERT INTO partstock (part_code, item_name, cost_price, selling_price, stock_quantity, unit, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [
                data.part_code,
                data.name,
                data.cost,
                data.price,
                data.stock_quantity ?? 0,
                data.unit ?? null
            ]
        );

        return await PartStock.findById(result.insertId);
    },

    updateById: async (id, data = {}) => {
        const conn = await connectDB();
        const [rows] = await conn.execute(`SELECT * FROM partstock WHERE id = ?`, [id]);

        if (!rows.length) return null;

        const current = rows[0];

        await conn.execute(
            `UPDATE partstock 
       SET part_code = ?, 
           item_name = ?, 
           cost_price = ?, 
           selling_price = ?, 
           stock_quantity = ?, 
           unit = ?, 
           updated_at = NOW()
       WHERE id = ?`,
            [
                data.part_code ?? current.part_code,
                data.name ?? current.item_name,
                data.cost ?? current.cost_price,
                data.price ?? current.selling_price,
                data.stock_quantity ?? current.stock_quantity,
                data.unit ?? current.unit,
                id
            ]
        );

        return await PartStock.findById(id);
    },

    deleteById: async (id) => {
        const conn = await connectDB();
        const [result] = await conn.execute(`DELETE FROM partstock WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }
};
