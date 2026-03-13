import express from 'express';
import { createPayment, getPaymentsByInvoice, deletePayment } from '../controllers/payment.controller.js';
import { protect, adminCheck } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', protect, createPayment);
router.get('/invoice/:invoiceId', protect, getPaymentsByInvoice);
router.delete('/:id', protect, adminCheck, deletePayment);

export default router;
