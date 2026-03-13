import express from 'express';
import { 
    getAllInvoices, 
    getInvoiceById, 
    createInvoice, 
    updateInvoiceStatus, 
    deleteInvoice 
} from '../controllers/invoice.controller.js';
import { protect, adminCheck } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Invoice management API
 */

router.get('/', protect, getAllInvoices);
router.get('/:id', protect, getInvoiceById);
router.post('/', protect, createInvoice);
router.put('/:id/status', protect, adminCheck, updateInvoiceStatus);
router.delete('/:id', protect, adminCheck, deleteInvoice);

export default router;
