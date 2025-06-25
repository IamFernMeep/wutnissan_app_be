import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: String,
  email: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default model('User', userSchema);
