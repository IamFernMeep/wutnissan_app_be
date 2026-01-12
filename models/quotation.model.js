// models/quotation.model.js
import connectDB from "../config/db.js";
import { Customer } from "./customer.model.js";
import { QuotationPart } from "./quotation_parts.model.js";
import { Car } from "./car.model.js";

async function getCarByCustomer(customerId) {
    const cars = await Car.findByCustomerId(customerId);
    if (!cars || !cars.length) return null;
    return cars.length === 1 ? cars[0] : cars;
}

async function toListDTO(row) {
    const customer = await Customer.findById(row.customer_id);
    const car = await getCarByCustomer(row.customer_id);
    const parts = await QuotationPart.findByQuotationId(row.id);

    return {
        _id: String(row.id),
        billNo: row.bill_no,
        name: customer?.name ?? row.customer_name,
        phone: customer?.phone ?? row.customer_phone,
        car,
        parts,
        pickupDateTime: row.pickup_datetime ? new Date(row.pickup_datetime).toISOString() : null,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : null
    };
}

async function toDetailDTO(row) {
    const customer = await Customer.findById(row.customer_id);
    const car = await getCarByCustomer(row.customer_id);

    const parts = await QuotationPart.findByQuotationId(row.id);

    return {
        _id: String(row.id),
        billNo: row.bill_no,
        name: customer?.name ?? row.customer_name,
        phone: customer?.phone ?? row.customer_phone,
        car,
        parts,
        pickupDateTime: row.pickup_datetime ? new Date(row.pickup_datetime).toISOString() : null,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : null
    };
}


export const Quotation = {
    findAll: async () => {
        const conn = await connectDB();
        const [rows] = await conn.execute(
            `SELECT * FROM quotations ORDER BY created_at DESC`
        );

        const data = [];
        for (const row of rows) {
            data.push(await toListDTO(row));
        }
        return data;
    },

    findByIdOrBillNo: async (idOrBillNo) => {
        const conn = await connectDB();
        const isId = /^\d+$/.test(String(idOrBillNo));
        const sql = isId
            ? `SELECT * FROM quotations WHERE id = ? LIMIT 1`
            : `SELECT * FROM quotations WHERE bill_no = ? LIMIT 1`;
        const [rows] = await conn.execute(sql, [idOrBillNo]);
        if (!rows.length) return null;

        return await toDetailDTO(rows[0]);
    },

    create: async (data = {}) => {
        const conn = await connectDB();

        // ตรวจสอบ customerId
        if (!data.customerId) throw Object.assign(new Error("customerId is required"), { statusCode: 400 });

        const customer = await Customer.findById(data.customerId);
        if (!customer) throw Object.assign(new Error("Customer not found"), { statusCode: 404 });

        // สร้าง billNo แบบ QT-YYYYMMDD-XXX
        let billNo = data.billNo;
        if (!billNo) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}${mm}${dd}`;

            // Query ว่ามี quotation ของวันนี้กี่ตัวแล้ว
            const [rows] = await conn.execute(
                `SELECT COUNT(*) as count FROM quotations 
             WHERE DATE(created_at) = CURDATE()`
            );
            const countToday = rows[0]?.count || 0;
            const seq = String(countToday + 1).padStart(3, '0'); // 001, 002, ...

            billNo = `QT-${dateStr}-${seq}`;
        }

        // insert ข้อมูล quotation
        const [result] = await conn.execute(
            `INSERT INTO quotations 
         (bill_no, customer_id, customer_name, customer_phone, pickup_datetime, created_at) 
         VALUES (?, ?, ?, ?, ?, ?)`,
            [
                billNo,
                data.customerId,
                customer.name,
                customer.phone ?? null,
                data.pickupDateTime ?? null,
                new Date()
            ]
        );

        const quotationId = result.insertId;

        // insert parts ถ้ามี
        if (Array.isArray(data.parts) && data.parts.length) {
            for (const p of data.parts) {
                await QuotationPart.create(quotationId, p);
            }
        }

        return await Quotation.findByIdOrBillNo(billNo);
    },

    updateByIdOrBillNo: async (idOrBillNo, data = {}) => {
        const conn = await connectDB();
        const current = await Quotation.findByIdOrBillNo(idOrBillNo);
        if (!current) return null;

        await conn.execute(
            `UPDATE quotations 
            SET pickup_datetime = ?, customer_name = ?, customer_phone = ?
            WHERE ${/^\d+$/.test(String(idOrBillNo)) ? "id = ?" : "bill_no = ?"}`,
            [
                data.pickupDateTime ?? current.pickupDateTime,
                current.name,
                current.phone,
                idOrBillNo
            ]
        );

        // update parts
        if (Array.isArray(data.parts)) {
            await QuotationPart.deleteByQuotationId(current._id);
            for (const p of data.parts) {
                await QuotationPart.create(current._id, p);
            }
        }

        return await Quotation.findByIdOrBillNo(idOrBillNo);
    },

    deleteByIdOrBillNo: async (idOrBillNo) => {
        const conn = await connectDB();
        const isId = /^\d+$/.test(String(idOrBillNo));
        const [result] = await conn.execute(
            `DELETE FROM quotations WHERE ${isId ? "id = ?" : "bill_no = ?"}`,
            [idOrBillNo]
        );
        return result.affectedRows > 0;
    }
};
