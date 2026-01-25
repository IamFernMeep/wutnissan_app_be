// models/customer.model.js
import pool from "../config/db.js";

export const Customer = {

  // =========================
  // Find All Customers
  // =========================
  findAll: async () => {
    const [customers] = await pool.execute(`
      SELECT 
        c.id AS customer_id,
        c.name,
        c.phone,
        c.line,
        c.address_detail AS addressDetail,

        p.id AS province_id,
        p.name_th AS province_name,
        d.id AS district_id,
        d.name_th AS district_name,
        s.id AS subdistrict_id,
        s.name_th AS subdistrict_name,
        s.zip_code AS postalCode
      FROM customers c
      JOIN provinces p ON c.province_id = p.id
      JOIN districts d ON c.district_id = d.id
      JOIN subdistricts s ON c.subdistrict_id = s.id
      ORDER BY c.id ASC
    `);

    const data = await Promise.all(
      customers.map(async (c) => {
        const [cars] = await pool.execute(
          `SELECT id, registration, model, color,
                chassis_number AS chassisNumber,
                mileage,
                image_url AS imageUrl
          FROM cars
           WHERE customer_id = ?`,
          [c.customer_id]
        );

        return {
          customer_id: c.customer_id,
          name: c.name,
          phone: c.phone,
          line: c.line,
          address: {
            addressDetail: c.addressDetail,
            province: { id: c.province_id, name: c.province_name },
            district: { id: c.district_id, name: c.district_name },
            subdistrict: { id: c.subdistrict_id, name: c.subdistrict_name },
            postalCode: c.postalCode
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
    if (!data.name) {
      const err = new Error("name is required");
      err.statusCode = 400;
      throw err;
    }

    const address = data.address || {};

    const provinceId =
      address.province?.id ?? address.province_id ?? null;
    const districtId =
      address.district?.id ?? address.district_id ?? null;
    const subdistrictId =
      address.subdistrict?.id ?? address.subdistrict_id ?? null;

    const [result] = await pool.execute(
      `INSERT INTO customers
       (name, phone, line, address_detail, province_id, district_id, subdistrict_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.phone ?? null,
        data.line ?? null,
        address.addressDetail ?? null,
        provinceId,
        districtId,
        subdistrictId
      ]
    );

    const customerId = result.insertId;

    // รองรับ car เป็น object หรือ array
    let cars = [];
    if (Array.isArray(data.car)) {
      cars = data.car;
    } else if (data.car && typeof data.car === "object") {
      cars = [data.car];
    }

    for (const car of cars) {
      await pool.execute(
        `INSERT INTO cars
        (customer_id, registration, model, color, chassis_number, mileage, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          customerId,
          car.registration,
          car.model ?? null,
          car.color ?? null,
          car.chassisNumber ?? null,
          car.mileage ?? null,
          car.imageUrl ?? null
        ]
      );
    }

    return Customer.findById(customerId);
  },

  // =========================
  // Find By ID
  // =========================
  findById: async (id) => {
    const [customers] = await pool.execute(
      `
      SELECT 
        c.id AS customer_id,
        c.name,
        c.phone,
        c.line,
        c.address_detail AS addressDetail,

        p.id AS province_id,
        p.name_th AS province_name,
        d.id AS district_id,
        d.name_th AS district_name,
        s.id AS subdistrict_id,
        s.name_th AS subdistrict_name,
        s.zip_code AS postalCode
      FROM customers c
      JOIN provinces p ON c.province_id = p.id
      JOIN districts d ON c.district_id = d.id
      JOIN subdistricts s ON c.subdistrict_id = s.id
      WHERE c.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!customers.length) return null;

    const c = customers[0];

    const [cars] = await pool.execute(
      `SELECT id, registration, model, color,
        chassis_number AS chassisNumber,
        mileage,
        image_url AS imageUrl
        FROM cars
       WHERE customer_id = ?`,
      [id]
    );

    return {
      customer_id: c.customer_id,
      name: c.name,
      phone: c.phone,
      line: c.line,
      address: {
        addressDetail: c.addressDetail,
        province: { id: c.province_id, name: c.province_name },
        district: { id: c.district_id, name: c.district_name },
        subdistrict: { id: c.subdistrict_id, name: c.subdistrict_name },
        postalCode: c.postalCode
      },
      car: cars.length === 1 ? cars[0] : cars
    };
  },

  // =========================
  // Update By ID
  // =========================
  updateById: async (id, data = {}) => {
    const [rows] = await pool.execute(
      `SELECT * FROM customers WHERE id = ?`,
      [id]
    );
    if (!rows.length) return null;

    const current = rows[0];
    const address = data.address || {};

    await pool.execute(
      `UPDATE customers
       SET name = ?, phone = ?, line = ?, address_detail = ?, province_id = ?, district_id = ?, subdistrict_id = ?
       WHERE id = ?`,
      [
        data.name ?? current.name,
        data.phone ?? current.phone,
        data.line ?? current.line,
        address.addressDetail ?? current.address_detail,
        address.province?.id ?? address.province_id ?? current.province_id,
        address.district?.id ?? address.district_id ?? current.district_id,
        address.subdistrict?.id ?? address.subdistrict_id ?? current.subdistrict_id,
        id
      ]
    );

    // รองรับ car object / array
    let cars = [];
    if (Array.isArray(data.car)) {
      cars = data.car;
    } else if (data.car && typeof data.car === "object") {
      cars = [data.car];
    }

    if (cars.length) {
      await pool.execute(`DELETE FROM cars WHERE customer_id = ?`, [id]);

      for (const car of cars) {
        await pool.execute(
          `INSERT INTO cars
          (customer_id, registration, model, color, chassis_number, mileage, image_url)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            car.registration,
            car.model ?? null,
            car.color ?? null,
            car.chassisNumber ?? null,
            car.mileage ?? null,
            car.imageUrl ?? null
          ]
        );
      }
    }

    return Customer.findById(id);
  },

  // =========================
  // Delete By ID
  // =========================
  deleteById: async (id) => {
    await pool.execute(`DELETE FROM cars WHERE customer_id = ?`, [id]);
    const [result] = await pool.execute(
      `DELETE FROM customers WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
};
