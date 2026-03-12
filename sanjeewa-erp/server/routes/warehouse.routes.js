import express from 'express';
import { 
    getAllWarehouses, 
    getWarehouseById, 
    createWarehouse, 
    updateWarehouse, 
    deleteWarehouse 
} from '../controllers/warehouse.controller.js';
import { protect, adminCheck } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Warehouses
 *   description: Warehouse and Shop management API
 */

/**
 * @swagger
 * /api/warehouses:
 *   get:
 *     summary: Get all warehouses
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of warehouses
 */
router.get('/', protect, getAllWarehouses);

/**
 * @swagger
 * /api/warehouses/{id}:
 *   get:
 *     summary: Get warehouse by ID
 *     tags: [Warehouses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warehouse details
 */
router.get('/:id', protect, getWarehouseById);

/**
 * @swagger
 * /api/warehouses:
 *   post:
 *     summary: Create a new warehouse
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Warehouse created
 */
router.post('/', protect, adminCheck, createWarehouse);

/**
 * @swagger
 * /api/warehouses/{id}:
 *   put:
 *     summary: Update a warehouse
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Warehouse updated
 */
router.put('/:id', protect, adminCheck, updateWarehouse);

/**
 * @swagger
 * /api/warehouses/{id}:
 *   delete:
 *     summary: Delete a warehouse
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Warehouse deleted
 */
router.delete('/:id', protect, adminCheck, deleteWarehouse);

export default router;
