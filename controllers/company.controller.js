// controllers/company.controller.js
import { Company } from "../models/company.model.js";

// GET /api/v1/company
export async function getCompany(req, res) {
  try {
    const company = await Company.findOne();

    res.status(200).json({
      code: 200,
      message: "success",
      data: company
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message,
      data: null
    });
  }
}


// PUT /api/v1/company
export async function updateCompany(req, res) {
  try {
    await Company.updateSingleton(req.body);

    const company = await Company.findOne();

    res.status(200).json({
      code: 200,
      message: "success",
      data: company
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message,
      data: null
    });
  }
}
