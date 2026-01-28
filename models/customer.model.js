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
  // Update By ID (FormData-friendly)
  // =========================
  // models/customer.model.js
  updateById: async (id, data = {}) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. load customer
      const [rows] = await conn.execute(
        `SELECT * FROM customers WHERE id = ?`,
        [id]
      );
      if (!rows.length) {
        await conn.rollback();
        return null;
      }

      const current = rows[0];

      // 2. update customer
      await conn.execute(
        `UPDATE customers
       SET name = ?, phone = ?, line = ?, address_detail = ?,
           province_id = ?, district_id = ?, subdistrict_id = ?
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

      // 3. load car
      const [cars] = await conn.execute(
        `SELECT * FROM cars WHERE customer_id = ? LIMIT 1`,
        [id]
      );
      const currentCar = cars[0];

      // 4. ถ้าไม่มีข้อมูลรถ → ข้าม
      if (!data.car && !currentCar) {
        await conn.commit();
        return Customer.findById(id);
      }

      // ❗ registration ห้าม null
      const registration =
        data.car?.registration ?? currentCar?.registration;

      if (!registration) {
        throw new Error("car.registration is required");
      }

      // 5. update car
      // 5. update car
      if (currentCar) {

        // ⭐ FIX image_url logic
        let imageUrl = currentCar.image_url;

        if (data.car && Object.prototype.hasOwnProperty.call(data.car, "imageUrl")) {
          // imageUrl อาจเป็น string หรือ null
          imageUrl = data.car.imageUrl;
        }

        await conn.execute(
          `UPDATE cars
     SET registration = ?, model = ?, color = ?,
         chassis_number = ?, mileage = ?, image_url = ?
     WHERE customer_id = ?`,
          [
            registration,
            data.car?.model ?? currentCar.model,
            data.car?.color ?? currentCar.color,
            data.car?.chassisNumber ?? currentCar.chassis_number,
            Number.isFinite(data.car?.mileage)
              ? data.car.mileage
              : currentCar.mileage,
            imageUrl, // ✅ สำคัญมาก
            id
          ]
        );

      } else {
        // fallback insert (ไม่ต้องแก้)
        await conn.execute(
          `INSERT INTO cars
     (customer_id, registration, model, color, chassis_number, mileage, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            registration,
            data.car?.model ?? null,
            data.car?.color ?? null,
            data.car?.chassisNumber ?? null,
            data.car?.mileage ?? null,
            data.car?.imageUrl ?? null
          ]
        );
      }

      await conn.commit();
      return Customer.findById(id);

    } catch (err) {
      await conn.rollback();
      console.error("UPDATE CUSTOMER ERROR:", err.message);
      throw err;
    } finally {
      conn.release();
    }
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
