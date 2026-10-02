import pool from "../config/db.js";
import { Customer } from "./customer.model.js";
import { QuotationPart } from "./quotation_parts.model.js";
import { Car } from "./car.model.js";

/* =========================
   Helper: DTO
========================= */
async function toDTO(row) {
    const customer = await Customer.findById(row.customer_id);
    const car = row.car_id ? await Car.findById(row.car_id) : null;
    const parts = await QuotationPart.findByQuotationId(row.id);

    return {
        _id: String(row.id),
        customerId: String(row.customer_id),
        carId: row.car_id ? String(row.car_id) : null,
        billNo: row.bill_no,

        name: customer?.name ?? row.customer_name,
        phone: customer?.phone ?? row.customer_phone,
        remark: row.remark ?? null,

        address: customer?.address
            ? {
                addressDetail: customer.address.addressDetail,
                province: customer.address.province,
                district: customer.address.district,
                subdistrict: customer.address.subdistrict,
                postalCode: customer.address.postalCode
            }
            : null,

        car,
        parts,

        allTotal: Number(row.all_total ?? 0),
        costs: Number(row.costs ?? 0),
        finalTotal: Number(row.final_total ?? 0),

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

    /* =========================
       GET ALL
    ========================= */
    findAll: async () => {
        const [rows] = await pool.execute(
            `SELECT * FROM quotations ORDER BY created_at DESC`
        );

        const result = [];
        for (const row of rows) {
            result.push(await toDTO(row));
        }
        return result;
    },

    /* =========================
       GET BY ID OR BILL NO
    ========================= */
    findByIdOrBillNo: async (idOrBillNo) => {
        const isId = /^\d+$/.test(String(idOrBillNo));
        const sql = isId
            ? `SELECT * FROM quotations WHERE id = ? LIMIT 1`
            : `SELECT * FROM quotations WHERE bill_no = ? LIMIT 1`;

        const [rows] = await pool.execute(sql, [idOrBillNo]);
        if (!rows.length) return null;

        return toDTO(rows[0]);
    },

    /* =========================
       CREATE
    ========================= */
    create: async (data = {}) => {
        if (!data.customerId) {
            throw Object.assign(new Error("customerId is required"), { statusCode: 400 });
        }
        if (!data.carId) {
            throw Object.assign(new Error("carId is required"), { statusCode: 400 });
        }

        const customer = await Customer.findById(data.customerId);
        if (!customer) {
            throw Object.assign(new Error("Customer not found"), { statusCode: 404 });
        }

        const car = await Car.findById(data.carId);
        if (!car) {
            throw Object.assign(new Error("Car not found"), { statusCode: 404 });
        }

        const parts = Array.isArray(data.parts)
            ? data.parts
            : [];

        const allTotal = parts.reduce(
            (sum, p) => sum + Number(p.total ?? (p.qty * p.price) ?? 0),
            0
        );

        const costs = Number(data.costs ?? 0);
        const finalTotal = allTotal + costs;

        // ===== insert quotation =====
        const connection = await pool.getConnection();
        let billNo;

        try {
            await connection.beginTransaction();
            billNo = data.billNo;

            if (!billNo) {

                const now = new Date();

                const yyyy = now.getFullYear();

                const mm = String(
                    now.getMonth() + 1
                ).padStart(2, "0");

                const dd = String(
                    now.getDate()
                ).padStart(2, "0");

                const dateStr =
                    `${yyyy}${mm}${dd}`;

                const sequenceDate =
                    `${yyyy}-${mm}-${dd}`;

                await connection.execute(
                    `INSERT INTO quotation_sequences
                        (sequence_date, last_number)
                    VALUES(?, 1)
                    ON DUPLICATE KEY UPDATE
                    last_number = last_number + 1`,
                    [sequenceDate]
                );

                const [sequenceRows] =
                    await connection.execute(
                        `SELECT last_number
                         FROM quotation_sequences
                         WHERE sequence_date = ?
                         FOR UPDATE`,
                        [sequenceDate]
                    );

                if (!sequenceRows.length) {
                    throw new Error(
                        "Unable to generate quotation sequence"
                    );
                }

                const sequence =
                    Number(
                        sequenceRows[0].last_number
                    );

                const seq =
                    String(sequence).padStart(3, "0");

                billNo =
                    `QT - ${dateStr} -${seq} `;
            }

            const [result] =
                await connection.execute(
                    `INSERT INTO quotations
             (bill_no, customer_id, car_id, customer_name, customer_phone,
              remark, pickup_datetime, all_total, costs, final_total, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                    [
                        billNo,
                        data.customerId,
                        data.carId,
                        customer.name,
                        customer.phone ?? null,
                        data.remark ?? null,
                        data.pickupDateTime ?? null,
                        allTotal,
                        costs,
                        finalTotal
                    ]
                );

            const quotationId = result.insertId;

            for (const part of parts) {
                await QuotationPart.create(quotationId, part, connection);
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
        return Quotation.findByIdOrBillNo(billNo);
    },

    /* =========================
       UPDATE
    ========================= */
    updateByIdOrBillNo: async (idOrBillNo, data = {}) => {
        const current = await Quotation.findByIdOrBillNo(idOrBillNo);
        if (!current) return null;

        const parts = Array.isArray(data.parts) ? data.parts : current.parts;

        const allTotal = parts.reduce(
            (sum, p) => sum + Number(p.total ?? (p.qty * p.price) ?? 0),
            0
        );

        const costs = Number(data.costs ?? current.costs ?? 0);
        const finalTotal = allTotal + costs;

        const isId = /^\d+$/.test(String(idOrBillNo));

        await pool.execute(
            `UPDATE quotations
             SET pickup_datetime = ?,
                 remark = ?,
                 all_total = ?,
                 costs = ?,
                 final_total = ?
             WHERE ${isId ? "id = ?" : "bill_no = ?"}`,
            [
                data.pickupDateTime ?? current.pickupDateTime,
                data.remark ?? current.remark,
                allTotal,
                costs,
                finalTotal,
                idOrBillNo
            ]
        );

        if (Array.isArray(data.parts)) {
            await QuotationPart.deleteByQuotationId(current._id, connection);
            for (const part of data.parts) {
                await QuotationPart.create(current._id, part);
            }
        }

        return Quotation.findByIdOrBillNo(idOrBillNo);
    },

    /* =========================
       DELETE
    ========================= */
    deleteByIdOrBillNo: async (idOrBillNo) => {
        const isId = /^\d+$/.test(String(idOrBillNo));
        const [result] = await pool.execute(
            `DELETE FROM quotations WHERE ${isId ? "id = ?" : "bill_no = ?"}`,
            [idOrBillNo]
        );
        return result.affectedRows > 0;
    }
};
