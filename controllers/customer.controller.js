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
export async function createCustomer(req, res) {
  try {
    const newCustomer = await Customer.create(req.body);
    return res.status(201).json({ code: 201, message: "success", data: newCustomer });
  } catch (err) {
    const status = err.statusCode || 400;
    return res.status(status).json({ code: status, message: err.message, data: [] });
  }
}

// PATCH /api/v1/customers/:id
export async function updateCustomer(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ code: 400, message: "Invalid customer id", data: [] });

  try {
    const updatedCustomer = await Customer.updateById(id, req.body);

    if (!updatedCustomer) {
      return res.status(404).json({ code: 404, message: "Customer not found", data: [] });
    }

    return res.status(200).json({ code: 200, message: "success", data: updatedCustomer });
  } catch (err) {
    const status = err.statusCode || 400;
    return res.status(status).json({ code: status, message: err.message, data: [] });
  }
}

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
