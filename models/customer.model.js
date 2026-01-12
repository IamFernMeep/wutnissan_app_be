// models/customer.model.js
import connectDB from "../config/db.js";

export const Customer = {

  // =========================
  // Find All Customers
  // =========================
  findAll: async () => {
    const conn = await connectDB();

    const [customers] = await conn.execute(`
      SELECT 
        c.id AS customer_id,
        c.name,
        c.phone,
        c.line,
        c.address_detail AS addressDetail,
        p.name_th AS province,
        d.name_th AS district,
        s.name_th AS subdistrict,
        s.zip_code AS postalCode
      FROM customers c
      JOIN provinces p ON c.province_id = p.id
      JOIN districts d ON c.district_id = d.id
      JOIN subdistricts s ON c.subdistrict_id = s.id
      ORDER BY c.id ASC
    `);

    const data = await Promise.all(
      customers.map(async (c) => {
        const [cars] = await conn.execute(
          `SELECT id, registration, model, color, chassis_number AS chassisNumber, mileage
           FROM cars WHERE customer_id = ?`,
          [c.customer_id]
        );

        const {
          addressDetail,
          province,
          district,
          subdistrict,
          postalCode,
          ...customer
        } = c;

        return {
          ...customer,
          address: {
            addressDetail,
            province,
            district,
            subdistrict,
            postalCode
          },
          car: cars.length === 1 ? cars[0] : cars
        };
      })
    );

    return data;
  },


  // =========================
  // Create Customer
  // =========================
  create: async (data = {}) => {
    const conn = await connectDB();

    if (!data.name) {
      const err = new Error("name is required");
      err.statusCode = 400;
      throw err;
    }

    const [result] = await conn.execute(
      `INSERT INTO customers (name, phone, line, address_detail, province_id, district_id, subdistrict_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.phone ?? null,
        data.line ?? null,
        data.address?.addressDetail ?? null,
        data.address?.province_id,
        data.address?.district_id,
        data.address?.subdistrict_id
      ]
    );

    const customerId = result.insertId;

    // insert cars
    if (Array.isArray(data.car)) {
      for (const car of data.car) {
        await conn.execute(
          `INSERT INTO cars (customer_id, registration, model, color, chassis_number, mileage)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            customerId,
            car.registration,
            car.model ?? null,
            car.color ?? null,
            car.chassisNumber ?? null,
            car.mileage ?? null
          ]
        );
      }
    }

    return await Customer.findById(customerId);
  },


  // =========================
  // Find By ID
  // =========================
  findById: async (id) => {
    const conn = await connectDB();

    const [customers] = await conn.execute(
      `SELECT 
        c.id AS customer_id,
        c.name,
        c.phone,
        c.line,
        c.address_detail AS addressDetail,
        p.name_th AS province,
        d.name_th AS district,
        s.name_th AS subdistrict,
        s.zip_code AS postalCode
      FROM customers c
      JOIN provinces p ON c.province_id = p.id
      JOIN districts d ON c.district_id = d.id
      JOIN subdistricts s ON c.subdistrict_id = s.id
      WHERE c.id = ?
      LIMIT 1`,
      [id]
    );

    if (!customers.length) return null;

    const customer = customers[0];

    const [cars] = await conn.execute(
      `SELECT id, registration, model, color, chassis_number AS chassisNumber, mileage
       FROM cars WHERE customer_id = ?`,
      [id]
    );

    const {
      addressDetail,
      province,
      district,
      subdistrict,
      postalCode,
      ...customerData
    } = customer;

    return {
      ...customerData,
      address: {
        addressDetail,
        province,
        district,
        subdistrict,
        postalCode
      },
      car: cars.length === 1 ? cars[0] : cars
    };
  },


  // =========================
  // Update By ID
  // =========================
  updateById: async (id, data = {}) => {
    const conn = await connectDB();

    const [rows] = await conn.execute(
      `SELECT * FROM customers WHERE id = ?`,
      [id]
    );

    if (!rows.length) return null;

    const current = rows[0];

    await conn.execute(
      `UPDATE customers 
       SET name = ?, phone = ?, line = ?, address_detail = ?, province_id = ?, district_id = ?, subdistrict_id = ?
       WHERE id = ?`,
      [
        data.name ?? current.name,
        data.phone ?? current.phone,
        data.line ?? current.line,
        data.address?.addressDetail ?? current.address_detail,
        data.address?.province_id ?? current.province_id,
        data.address?.district_id ?? current.district_id,
        data.address?.subdistrict_id ?? current.subdistrict_id,
        id
      ]
    );

    // replace cars
    if (Array.isArray(data.car)) {
      await conn.execute(`DELETE FROM cars WHERE customer_id = ?`, [id]);

      for (const car of data.car) {
        await conn.execute(
          `INSERT INTO cars (customer_id, registration, model, color, chassis_number, mileage)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            id,
            car.registration,
            car.model ?? null,
            car.color ?? null,
            car.chassisNumber ?? null,
            car.mileage ?? null
          ]
        );
      }
    }

    return await Customer.findById(id);
  }
};
