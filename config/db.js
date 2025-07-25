import { connect } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();  // ต้องเรียกก่อนใช้ process.env

const connectDB = async () => {
  try {
    await connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
