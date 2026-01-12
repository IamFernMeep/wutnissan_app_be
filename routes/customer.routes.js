import { Router } from 'express';
import {
  getListCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/customer.controller.js';

const router = Router();

router.get('/', getListCustomers);
router.get("/:id", getCustomerById);
router.post('/', createCustomer);
router.patch('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
