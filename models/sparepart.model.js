// models/sparepart.model.js
import { Schema, model } from 'mongoose';

const sparepartSchema = new Schema(
  {
    name: { type: String, required: true },
    cost_price: { type: Number, required: true },
    sale_price: { type: Number, required: true },
    stock_quantity: { type: Number, required: true },
    unit: { type: String, required: true }
  },
  { timestamps: true }
);

export default model('Sparepart', sparepartSchema);
