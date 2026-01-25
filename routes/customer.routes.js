import { Router } from 'express';
import {
  getListCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/customer.controller.js';
import { uploadCarImage } from "../middlewares/upload.js";

const router = Router();

router.get('/', getListCustomers);
router.get("/:id", getCustomerById);
router.delete('/:id', deleteCustomer);
router.post("/", uploadCarImage.single("carImage"), createCustomer);
router.patch("/:id", uploadCarImage.single("carImage"), updateCustomer);

export default router;
