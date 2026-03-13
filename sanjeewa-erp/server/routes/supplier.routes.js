import express from 'express';
import { 
    getAllSuppliers, 
    getSupplierById, 
    createSupplier, 
    updateSupplier, 
    deleteSupplier 
} from '../controllers/supplier.controller.js';
import { protect, adminCheck } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Suppliers
 *   description: Supplier management API
 */

router.get('/', protect, getAllSuppliers);
router.get('/:id', protect, getSupplierById);
router.post('/', protect, adminCheck, createSupplier);
router.put('/:id', protect, adminCheck, updateSupplier);
router.delete('/:id', protect, adminCheck, deleteSupplier);

export default router;
