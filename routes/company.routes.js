// routes/company.route.js
import { Router } from 'express';
import { getCompany, updateCompany } from '../controllers/company.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/v1/company
router.get('/', authMiddleware, getCompany);

// PUT /api/v1/company
router.put('/', authMiddleware, updateCompany);

export default router;
