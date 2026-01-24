// src/controllers/report.controller.js
import { Report } from "../models/report.model.js";

export const ReportController = {

    dashboard: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;

            const data = await Report.dashboard(startDate, endDate);

            res.json({
                code: 200,
                message: "success",
                data
            });

        } catch (err) {
            console.error("Dashboard report error:", err);
            res.status(500).json({
                code: 500,
                message: "Internal server error",
                error: err.message
            });
        }
    }
};
