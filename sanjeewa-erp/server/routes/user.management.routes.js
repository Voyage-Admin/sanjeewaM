import express from 'express';
import { 
    getAllUsers, 
    getUserById, 
    createUser, 
    updateUser, 
    deleteUser 
} from '../controllers/user.controller.js';
import { protect, adminCheck } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */

router.get('/', protect, adminCheck, getAllUsers);
router.get('/:id', protect, adminCheck, getUserById);
router.post('/', protect, adminCheck, createUser);
router.put('/:id', protect, adminCheck, updateUser);
router.delete('/:id', protect, adminCheck, deleteUser);

export default router;
