import mongoose from "mongoose";
import Customer from "../models/customer.model.js";

// GET /api/v1/customers
export async function getAllCustomers(req, res) {
  try {
    const customers = await Customer.find();
    res.status(200).json({ success: true, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/v1/customers
export async function createCustomer(req, res) {
  try {
    const newCustomer = new Customer(req.body);
    await newCustomer.save();
    res.status(201).json({ success: true, data: newCustomer });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// PATCH /api/v1/customers/:id
export async function updateCustomer(req, res) {
  const { id } = req.params;
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedCustomer) {
      return res.status(404).json({ success: false, error: "Customer not found" });
    }

    res.json(updatedCustomer);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// DELETE /api/v1/customers/:id
export async function deleteCustomer(req, res) {
  const { id } = req.params;
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(id);

    if (!deletedCustomer) {
      return res.status(404).json({ success: false, error: "Customer not found" });
    }

    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
