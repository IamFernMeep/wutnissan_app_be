import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import customerRoutes from "./routes/customer.routes.js";
import companyRoutes from "./routes/company.routes.js";
import jobsheetRoutes from "./routes/jobsheet.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import quotationRoutes from "./routes/quotation.routes.js";
import locationRoute from "./routes/location.route.js";
import partstockRoute from "./routes/partstock.routes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:4200",
  "https://wutnissandatagarage.com",
  "https://www.wutnissandatagarage.com",
  "https://api.wutnissandatagarage.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// middleware
app.use(express.json());

app.use("/api/v1", locationRoute);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/company", companyRoutes);
app.use("/api/v1/jobsheets", jobsheetRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/quotations", quotationRoutes);
app.use("/api/v1/partstocks", partstockRoute);

// connect DB + start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("❌ DB Connection Error:", err));
