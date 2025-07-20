import Sparepart from "../models/sparepart.model.js";

// GET /api/v1/spareparts
export async function getAllSpareparts(req, res) {
  try {
    const spareparts = await Sparepart.find();
    res.status(200).json({ success: true, data: spareparts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/v1/spareparts
export async function createSparepart(req, res) {
  try {
    const newSparepart = new Sparepart(req.body);
    await newSparepart.save();
    res.status(201).json({ success: true, data: newSparepart });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// PATCH /api/v1/spareparts/:id
export async function updateSparepart(req, res) {
  const { id } = req.params;
  try {
    const updatedSparepart = await Sparepart.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedSparepart) {
      return res.status(404).json({ success: false, error: "Sparepart not found" });
    }

    res.json(updatedSparepart);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// DELETE /api/v1/spareparts/:id
export async function deleteSparepart(req, res) {
  const { id } = req.params;
  try {
    const deletedSparepart = await Sparepart.findByIdAndDelete(id);

    if (!deletedSparepart) {
      return res.status(404).json({ success: false, error: "Sparepart not found" });
    }

    res.json({ success: true, message: "Sparepart deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
