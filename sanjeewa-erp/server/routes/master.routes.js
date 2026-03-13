import express from 'express';
import { getAll, create, update, remove } from '../controllers/master.controller.js';
import { protect, adminCheck } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/:type', protect, getAll);
router.post('/:type', protect, adminCheck, create);
router.put('/:type/:id', protect, adminCheck, update);
router.delete('/:type/:id', protect, adminCheck, remove);

export default router;
