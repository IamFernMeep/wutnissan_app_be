import mongoose from "mongoose";
import Customer from "../models/customer.model.js";

// GET /api/v1/customers
export async function getAllCustomers(req, res) {
  try {
    const customers = await Customer.find();
    res.status(200).json({
      code: 200,
      message: "success",
      data: customers
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message,
      data: []
    });
  }
}

// POST /api/v1/customers
export async function createCustomer(req, res) {
  try {
    const newCustomer = new Customer(req.body);
    await newCustomer.save();
    res.status(201).json({
      code: 201,
      message: "success",
      data: newCustomer
    });
  } catch (err) {
    res.status(400).json({
      code: 400,
      message: err.message,
      data: []
    });
  }
}

// PATCH /api/v1/customers/:id
export async function updateCustomer(req, res) {
  const { id } = req.params;
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedCustomer) {
      return res.status(404).json({
        code: 404,
        message: "Customer not found",
        data: []
      });
    }

    res.status(200).json({
      code: 200,
      message: "success",
      data: updatedCustomer
    });
  } catch (err) {
    res.status(400).json({
      code: 400,
      message: err.message,
      data: []
    });
  }
}

// DELETE /api/v1/customers/:id
export async function deleteCustomer(req, res) {
  const { id } = req.params;
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(id);

    if (!deletedCustomer) {
      return res.status(404).json({
        code: 404,
        message: "Customer not found",
        data: []
      });
    }

    res.status(200).json({
      code: 200,
      message: "Customer deleted successfully",
      data: []
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message,
      data: []
    });
  }
}
