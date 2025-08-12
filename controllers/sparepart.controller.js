import Sparepart from "../models/sparepart.model.js";

// GET /api/v1/spareparts
export async function getAllSpareparts(req, res) {
  try {
    const spareparts = await Sparepart.find();
    res.status(200).json({
      code: 200,
      message: "success",
      data: spareparts
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message,
      data: []
    });
  }
}

// POST /api/v1/spareparts
export async function createSparepart(req, res) {
  try {
    const newSparepart = new Sparepart(req.body);
    await newSparepart.save();
    res.status(201).json({
      code: 201,
      message: "success",
      data: newSparepart
    });
  } catch (err) {
    res.status(400).json({
      code: 400,
      message: err.message,
      data: []
    });
  }
}

// PATCH /api/v1/spareparts/:id
export async function updateSparepart(req, res) {
  const { id } = req.params;
  try {
    const updatedSparepart = await Sparepart.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedSparepart) {
      return res.status(404).json({
        code: 404,
        message: "Sparepart not found",
        data: []
      });
    }

    res.status(200).json({
      code: 200,
      message: "success",
      data: updatedSparepart
    });
  } catch (err) {
    res.status(400).json({
      code: 400,
      message: err.message,
      data: []
    });
  }
}

// DELETE /api/v1/spareparts/:id
export async function deleteSparepart(req, res) {
  const { id } = req.params;
  try {
    const deletedSparepart = await Sparepart.findByIdAndDelete(id);

    if (!deletedSparepart) {
      return res.status(404).json({
        code: 404,
        message: "Sparepart not found",
        data: []
      });
    }

    res.status(200).json({
      code: 200,
      message: "Sparepart deleted successfully",
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
