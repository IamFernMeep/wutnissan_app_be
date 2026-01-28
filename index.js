import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import customerRoutes from "./routes/customer.routes.js";
import companyRoutes from "./routes/company.routes.js";
import jobsheetRoutes from "./routes/jobsheet.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import quotationRoutes from "./routes/quotation.routes.js";
import locationRoutes from "./routes/location.route.js";
import partstockRoutes from "./routes/partstock.routes.js";
import reportRoutes from "./routes/report.routes.js";

import authMiddleware from "./middlewares/auth.middleware.js";

dotenv.config();

const app = express();

/* =========================
   CORS
========================= */
app.use(cors({
   origin: [
      "http://localhost:4200",
      "https://wutnissandatagarage.com",
      "https://www.wutnissandatagarage.com",
      "https://api.wutnissandatagarage.com",
      "https://api-dev.wutnissandatagarage.com"
   ],
   credentials: true
}));

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());

/* =========================
   STATIC UPLOADS
========================= */
const uploadPath =
   process.env.NODE_ENV === "production"
      ? "/home/wutnissa/domains/api.wutnissandatagarage.com/uploads"
      : "/home/wutnissa/domains/api-dev.wutnissandatagarage.com/uploads";

app.use("/uploads", express.static(uploadPath));

/* =========================
   PUBLIC ROUTES
========================= */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/location", locationRoutes);

/* =========================
   PROTECTED ROUTES
========================= */
app.use("/api/v1/jobsheets", authMiddleware, jobsheetRoutes);
app.use("/api/v1/customers", authMiddleware, customerRoutes);
app.use("/api/v1/company", authMiddleware, companyRoutes);
app.use("/api/v1/appointments", authMiddleware, appointmentRoutes);
app.use("/api/v1/quotations", authMiddleware, quotationRoutes);
app.use("/api/v1/partstocks", authMiddleware, partstockRoutes);
app.use("/api/v1/reports", authMiddleware, reportRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
   res.json({ status: "API running 🚀" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
   console.log(`🚀 Server running on port ${PORT}`);
});
