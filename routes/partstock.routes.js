import { Router } from 'express';
import {
    getListParts,
    getPartById,
    createPart,
    updatePart,
    deletePart
} from '../controllers/partstock.controller.js';

const router = Router();

router.get('/', getListParts);
router.get('/:id', getPartById);
router.post('/', createPart);
router.patch('/:id', updatePart);
router.delete('/:id', deletePart);

export default router;
