// src/models/report.model.js
import pool from "../config/db.js";

export const Report = {

    // =========================
    // Dashboard Report
    // =========================
    dashboard: async (startDate, endDate) => {
        const params = [];
        let dateCondition = "";

        if (startDate && endDate) {
            dateCondition = "AND DATE(created_at) BETWEEN ? AND ?";
            params.push(startDate, endDate);
        }

        // รายได้วันนี้
        const [[todayRevenue]] = await pool.execute(
            `SELECT COALESCE(SUM(final_total),0) AS total
       FROM jobsheets
       WHERE DATE(created_at) = CURDATE()
       AND status = 'เสร็จสิ้น'`
        );

        // รายได้เดือนนี้
        const [[monthRevenue]] = await pool.execute(
            `SELECT COALESCE(SUM(final_total),0) AS total
       FROM jobsheets
       WHERE MONTH(created_at) = MONTH(CURDATE())
       AND YEAR(created_at) = YEAR(CURDATE())
       AND status = 'เสร็จสิ้น'`
        );

        // งานทั้งหมด
        const [[totalJobs]] = await pool.execute(
            `SELECT COUNT(*) AS total FROM jobsheets`
        );

        // งานกำลังดำเนินการ
        const [[doingJobs]] = await pool.execute(
            `SELECT COUNT(*) AS total
       FROM jobsheets
       WHERE status = 'กำลังดำเนินการ'`
        );

        // รายได้รายเดือน (Chart)
        const [monthlyRevenue] = await pool.execute(
            `SELECT
         DATE_FORMAT(created_at, '%b') AS month,
         SUM(final_total) AS total
       FROM jobsheets
       WHERE status = 'เสร็จสิ้น'
       ${dateCondition}
       GROUP BY MONTH(created_at)
       ORDER BY MONTH(created_at)`,
            params
        );

        // สถานะงาน
        const [jobStatusRows] = await pool.execute(
            `SELECT status, COUNT(*) AS total
       FROM jobsheets
       GROUP BY status`
        );

        const jobStatus = {};
        jobStatusRows.forEach(row => {
            jobStatus[row.status] = row.total;
        });

        return {
            summary: {
                todayRevenue: todayRevenue.total,
                monthRevenue: monthRevenue.total,
                totalJobs: totalJobs.total,
                doingJobs: doingJobs.total
            },
            monthlyRevenue,
            jobStatus
        };
    }
};
