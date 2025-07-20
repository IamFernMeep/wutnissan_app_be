// models/company.model.js
import { Schema, model } from 'mongoose';

const companySchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },       // ที่อยู่บริษัทแบบเต็มๆ
  phone1: { type: String, required: true },        // เบอร์โทร 1
  phone2: { type: String },                         // เบอร์โทร 2 (ถ้ามี)
  tax_id: { type: String, required: true },        // เลขผู้เสียภาษี
  logo_url: { type: String },                       // โลโก้
  createdAt: { type: Date, default: Date.now }
});

export default model('Company', companySchema);
