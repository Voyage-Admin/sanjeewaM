import Warehouse from '../models/warehouse.model.js';
import Product from '../models/product.model.js';

export const getAllWarehouses = async (req, res) => {
    try {
        const warehouses = await Warehouse.findAll({
            include: [{ model: Product, attributes: ['id', 'name', 'stock_quantity'] }]
        });
        res.json(warehouses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getWarehouseById = async (req, res) => {
    try {
        const warehouse = await Warehouse.findByPk(req.params.id, {
            include: [Product]
        });
        if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });
        res.json(warehouse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.create(req.body);
        res.status(201).json(warehouse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findByPk(req.params.id);
        if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });
        
        await warehouse.update(req.body);
        res.json(warehouse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findByPk(req.params.id);
        if (!warehouse) return res.status(404).json({ message: 'Warehouse not found' });
        
        await warehouse.destroy();
        res.json({ message: 'Warehouse deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
