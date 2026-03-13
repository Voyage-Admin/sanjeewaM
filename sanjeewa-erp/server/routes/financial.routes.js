import express from 'express';
import { 
    getAllFinancialEntries, 
    createFinancialEntry, 
    getFinancialSummary, 
    deleteFinancialEntry 
} from '../controllers/financial.controller.js';
import { protect, adminCheck } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getAllFinancialEntries);
router.get('/summary', protect, getFinancialSummary);
router.post('/', protect, adminCheck, createFinancialEntry);
router.delete('/:id', protect, adminCheck, deleteFinancialEntry);

export default router;
