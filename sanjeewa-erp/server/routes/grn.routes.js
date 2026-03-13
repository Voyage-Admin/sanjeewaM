import express from 'express';
import { 
    getAllGRNs, 
    getGRNById, 
    createGRN, 
    deleteGRN 
} from '../controllers/grn.controller.js';
import { protect, adminCheck } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getAllGRNs);
router.get('/:id', protect, getGRNById);
router.post('/', protect, createGRN); // Both ADMIN and REF might need to receive goods
router.delete('/:id', protect, adminCheck, deleteGRN);

export default router;
