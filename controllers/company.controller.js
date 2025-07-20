import Company from "../models/company.model.js";

// GET /api/v1/company
export async function getCompany(req, res) {
  try {
    const company = await Company.find();
    res.status(200).json({ success: true, data: company });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/v1/company
export async function createCompany(req, res) {
  try {
    const newCompany = new Company(req.body);
    await newCompany.save();
    res.status(201).json({ success: true, data: newCompany });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// PATCH /api/v1/company/:id
export async function updateCompany(req, res) {
  const { id } = req.params;
  try {
    const updatedCompany = await Company.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedCompany) {
      return res.status(404).json({ success: false, error: "Company not found" });
    }

    res.json(updatedCompany);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// DELETE /api/v1/company/:id
// export async function deleteCompany(req, res) {
//   const { id } = req.params;
//   try {
//     const deletedCompany = await Company.findByIdAndDelete(id);

//     if (!deletedCompany) {
//       return res.status(404).json({ success: false, error: "Company not found" });
//     }

//     res.json({ success: true, message: "Company deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// }
