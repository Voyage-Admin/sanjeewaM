import Product from '../models/product.model.js';
import Warehouse from '../models/warehouse.model.js';

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [{ model: Warehouse, attributes: ['name'] }]
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [Warehouse]
        });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        
        await product.update(req.body);
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        
        await product.destroy();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const adjustStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { adjustment } = req.body; // Positive for addition, negative for subtraction

        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        product.stock_quantity += parseInt(adjustment);
        await product.save();

        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
