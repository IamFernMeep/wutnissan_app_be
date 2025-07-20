import { Router } from 'express';
import {
  getAllSpareparts,
  createSparepart,
  updateSparepart,
  deleteSparepart
} from '../controllers/sparepart.controller.js';

const router = Router();

router.get('/', getAllSpareparts);
router.post('/', createSparepart);
router.patch('/:id', updateSparepart);
router.delete('/:id', deleteSparepart);

export default router;
