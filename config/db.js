import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const config = {
      host: process.env.DB_HOST || "127.0.0.1",  // บังคับ IPv4
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

    console.log("Connecting to MySQL with config:", {
      host: config.host,
      user: config.user,
      database: config.database,
    });

    const connection = await mysql.createConnection(config);

    console.log("✅ MySQL connected");
    return connection;
  } catch (err) {
    console.error("❌ MySQL connection error:", err.message);
    throw err;   // ไม่ต้อง process.exit บน hosting
  }
};

export default connectDB;
