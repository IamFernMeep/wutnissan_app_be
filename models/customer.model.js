// models/customer.model.js
import { Schema, model } from 'mongoose';

const customerSchema = new Schema({
  name: String,
  address: {
    province: String,
    district: String,
    subdistrict: String,
    postalCode: String
  },
  phone: String,
  line: String,
  car: {
    registration: String,
    model: String,
    color: String,
    chassisNumber: String,
    mileage: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default model('Customer', customerSchema);
