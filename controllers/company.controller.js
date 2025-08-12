import Company from "../models/company.model.js";

// GET /api/v1/company
export async function getCompany(req, res) {
  try {
    const company = await Company.find();
    res.status(200).json({
      code: 200,
      message: "success",
      data: company
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message,
      data: []
    });
  }
}

// POST /api/v1/company
export async function createCompany(req, res) {
  try {
    const newCompany = new Company(req.body);
    await newCompany.save();
    res.status(201).json({
      code: 201,
      message: "success",
      data: newCompany
    });
  } catch (err) {
    res.status(400).json({
      code: 400,
      message: err.message,
      data: []
    });
  }
}

// PATCH /api/v1/company/:id
export async function updateCompany(req, res) {
  const { id } = req.params;
  try {
    const updatedCompany = await Company.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedCompany) {
      return res.status(404).json({
        code: 404,
        message: "Company not found",
        data: []
      });
    }

    res.status(200).json({
      code: 200,
      message: "success",
      data: updatedCompany
    });
  } catch (err) {
    res.status(400).json({
      code: 400,
      message: err.message,
      data: []
    });
  }
}

// DELETE /api/v1/company/:id
export async function deleteCompany(req, res) {
  const { id } = req.params;
  try {
    const deletedCompany = await Company.findByIdAndDelete(id);

    if (!deletedCompany) {
      return res.status(404).json({
        code: 404,
        message: "Company not found",
        data: []
      });
    }

    res.status(200).json({
      code: 200,
      message: "Company deleted successfully",
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
