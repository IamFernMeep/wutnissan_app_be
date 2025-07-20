import { Router } from 'express';
import {
  getCompany,
  createCompany,
  updateCompany,
} from '../controllers/company.controller.js';

const router = Router();

router.get('/', getCompany);
router.post('/', createCompany);
router.patch('/:id', updateCompany);

export default router;
