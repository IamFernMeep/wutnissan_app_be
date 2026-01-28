// controllers/customer.controller.js
import { Customer } from "../models/customer.model.js";

const parseId = (value) => {
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
};

// GET /api/v1/customers
export async function getListCustomers(req, res) {
  try {
    const customers = await Customer.findAll();
    return res.status(200).json({ code: 200, message: "success", data: customers });
  } catch (err) {
    return res.status(500).json({ code: 500, message: err.message, data: [] });
  }
}

// GET /api/v1/customers/:id
export async function getCustomerById(req, res) {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ code: 400, message: "Invalid customer id", data: null });
  }

  try {
    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({ code: 404, message: "Customer not found", data: null });
    }

    return res.status(200).json({
      code: 200,
      message: "success",
      data: customer
    });
  } catch (err) {
    return res.status(500).json({ code: 500, message: err.message, data: null });
  }
}

// POST /api/v1/customers
export const createCustomer = async (req, res, next) => {
  try {
    const imageUrl = req.file
      ? `/uploads/cars/${req.file.filename}`
      : null;

    const data = {
      name: req.body.name,
      phone: req.body.phone,
      line: req.body.line,
      address: {
        addressDetail: req.body.addressDetail,
        province_id: req.body.provinceId,
        district_id: req.body.districtId,
        subdistrict_id: req.body.subdistrictId
      },
      car: {
        registration: req.body.carRegistration,
        model: req.body.carModel,
        color: req.body.carColor,
        chassisNumber: req.body.carChassis,
        mileage: Number(req.body.carMileage),
        imageUrl
      }
    };

    const result = await Customer.create(data);
    res.json({ code: 200, message: "success", data: result });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/customers/:id
export const updateCustomer = async (req, res, next) => {
  try {
    const removeCarImage = req.body.removeCarImage === "1";

    let imageUrl;

    // 1️⃣ upload รูปใหม่
    if (req.file) {
      imageUrl = `/uploads/cars/${req.file.filename}`;
    }

    // 2️⃣ ลบรูป
    if (removeCarImage) {
      imageUrl = null;
    }

    const data = {
      name: req.body.name,
      phone: req.body.phone,
      line: req.body.line,
      address: {
        addressDetail: req.body.addressDetail,
        province_id: req.body.provinceId,
        district_id: req.body.districtId,
        subdistrict_id: req.body.subdistrictId
      },
      car: {
        registration: req.body.carRegistration,
        model: req.body.carModel,
        color: req.body.carColor,
        chassisNumber: req.body.carChassis,
        mileage: Number(req.body.carMileage),
        // ⭐ จุดสำคัญ
        ...(imageUrl !== undefined && { imageUrl })
      }
    };

    const result = await Customer.updateById(req.params.id, data);

    res.json({
      code: 200,
      message: "success",
      data: result
    });
  } catch (err) {
    next(err);
  }
};


// DELETE /api/v1/customers/:id
export async function deleteCustomer(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ code: 400, message: "Invalid customer id", data: [] });

  try {
    const ok = await Customer.deleteById(id);

    if (!ok) {
      return res.status(404).json({ code: 404, message: "Customer not found", data: [] });
    }

    return res.status(200).json({
      code: 200,
      message: "Customer deleted successfully",
      data: { id: String(id) }
    });
  } catch (err) {
    return res.status(500).json({ code: 500, message: err.message, data: [] });
  }
}
