import express from 'express';
import { 
    getAllShops, 
    getShopById, 
    createShop, 
    updateShop, 
    deleteShop 
} from '../controllers/shop.controller.js';
import { protect, adminCheck } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Shops
 *   description: Shop management API
 */

router.get('/', protect, getAllShops);
router.get('/:id', protect, getShopById);
router.post('/', protect, adminCheck, createShop);
router.put('/:id', protect, adminCheck, updateShop);
router.delete('/:id', protect, adminCheck, deleteShop);

export default router;
