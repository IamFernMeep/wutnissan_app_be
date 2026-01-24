// models/quotation.model.js
import pool from "../config/db.js";
import { Customer } from "./customer.model.js";
import { QuotationPart } from "./quotation_parts.model.js";
import { Car } from "./car.model.js";

/* =========================
   Helpers
========================= */

async function getCarByCustomer(customerId) {
    const cars = await Car.findByCustomerId(customerId);
    if (!cars || !cars.length) return null;
    return cars.length === 1 ? cars[0] : cars;
}

async function toDTO(row) {
    const customer = await Customer.findById(row.customer_id);
    const car = await getCarByCustomer(row.customer_id);
    const parts = await QuotationPart.findByQuotationId(row.id);

    return {
        _id: String(row.id),
        customerId: String(row.customer_id),
        billNo: row.bill_no,
        name: customer?.name ?? row.customer_name,
        phone: customer?.phone ?? row.customer_phone,
        car,
        parts,
        pickupDateTime: row.pickup_datetime
            ? new Date(row.pickup_datetime).toISOString()
            : null,
        createdAt: row.created_at
            ? new Date(row.created_at).toISOString()
            : null
    };
}

/* =========================
   Model
========================= */

export const Quotation = {

    // =========================
    // GET ALL
    // =========================
    findAll: async () => {
        const [rows] = await pool.execute(
            `SELECT * FROM quotations ORDER BY created_at DESC`
        );

        const data = [];
        for (const row of rows) {
            data.push(await toDTO(row));
        }
        return data;
    },

    // =========================
    // GET BY ID OR BILL NO
    // =========================
    findByIdOrBillNo: async (idOrBillNo) => {
        const isId = /^\d+$/.test(String(idOrBillNo));
        const sql = isId
            ? `SELECT * FROM quotations WHERE id = ? LIMIT 1`
            : `SELECT * FROM quotations WHERE bill_no = ? LIMIT 1`;

        const [rows] = await pool.execute(sql, [idOrBillNo]);
        if (!rows.length) return null;

        return await toDTO(rows[0]);
    },

    // =========================
    // CREATE
    // =========================
    create: async (data = {}) => {

        if (!data.customerId) {
            const err = new Error("customerId is required");
            err.statusCode = 400;
            throw err;
        }

        const customer = await Customer.findById(data.customerId);
        if (!customer) {
            const err = new Error("Customer not found");
            err.statusCode = 404;
            throw err;
        }

        // generate bill no
        let billNo = data.billNo;
        if (!billNo) {
            const now = new Date();
            const yyyy = now.getFullYear();
            const mm = String(now.getMonth() + 1).padStart(2, "0");
            const dd = String(now.getDate()).padStart(2, "0");
            const dateStr = `${yyyy}${mm}${dd}`;

            const [rows] = await pool.execute(
                `SELECT COUNT(*) AS count
                 FROM quotations
                 WHERE DATE(created_at) = CURDATE()`
            );

            const seq = String((rows[0]?.count || 0) + 1).padStart(3, "0");
            billNo = `QT-${dateStr}-${seq}`;
        }

        const [result] = await pool.execute(
            `INSERT INTO quotations
             (bill_no, customer_id, customer_name, customer_phone, pickup_datetime, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [
                billNo,
                data.customerId,
                customer.name,
                customer.phone ?? null,
                data.pickupDateTime ?? null
            ]
        );

        const quotationId = result.insertId;

        if (Array.isArray(data.parts) && data.parts.length) {
            for (const part of data.parts) {
                await QuotationPart.create(quotationId, part);
            }
        }

        return await Quotation.findByIdOrBillNo(billNo);
    },

    // =========================
    // UPDATE
    // =========================
    updateByIdOrBillNo: async (idOrBillNo, data = {}) => {
        const current = await Quotation.findByIdOrBillNo(idOrBillNo);
        if (!current) return null;

        await pool.execute(
            `UPDATE quotations
             SET pickup_datetime = ?
             WHERE ${/^\d+$/.test(String(idOrBillNo)) ? "id = ?" : "bill_no = ?"}`,
            [
                data.pickupDateTime ?? current.pickupDateTime,
                idOrBillNo
            ]
        );

        if (Array.isArray(data.parts)) {
            await QuotationPart.deleteByQuotationId(current._id);
            for (const part of data.parts) {
                await QuotationPart.create(current._id, part);
            }
        }

        return await Quotation.findByIdOrBillNo(idOrBillNo);
    },

    // =========================
    // DELETE
    // =========================
    deleteByIdOrBillNo: async (idOrBillNo) => {
        const isId = /^\d+$/.test(String(idOrBillNo));
        const [result] = await pool.execute(
            `DELETE FROM quotations WHERE ${isId ? "id = ?" : "bill_no = ?"}`,
            [idOrBillNo]
        );
        return result.affectedRows > 0;
    }
};
