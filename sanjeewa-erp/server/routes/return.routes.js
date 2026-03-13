import express from 'express';
import { 
    getAllSalesReturns, 
    createSalesReturn, 
    getAllSupplierReturns, 
    createSupplierReturn 
} from '../controllers/return.controller.js';
import { protect, adminCheck } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/sales', protect, getAllSalesReturns);
router.post('/sales', protect, createSalesReturn);

router.get('/supplier', protect, getAllSupplierReturns);
router.post('/supplier', protect, adminCheck, createSupplierReturn);

export default router;
