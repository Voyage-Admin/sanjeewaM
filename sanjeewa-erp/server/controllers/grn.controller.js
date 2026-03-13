import sequelize from '../config/database.js';
import { GRN, GRNItem, Product, Supplier, Warehouse } from '../db_sync.js';

export const getAllGRNs = async (req, res) => {
    try {
        const grns = await GRN.findAll({
            include: [{ model: Supplier, attributes: ['name'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(grns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getGRNById = async (req, res) => {
    try {
        const grn = await GRN.findByPk(req.params.id, {
            include: [
                { model: Supplier },
                { 
                    model: GRNItem, 
                    include: [
                        { model: Product, attributes: ['name', 'sku'] },
                        { model: Warehouse, attributes: ['name'] }
                    ] 
                }
            ]
        });
        if (!grn) return res.status(404).json({ message: 'GRN not found' });
        res.json(grn);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createGRN = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { grn_number, supplier_id, receive_date, items, note } = req.body;

        const grn = await GRN.create({
            grn_number,
            supplier_id,
            receive_date,
            note,
            total_amount: items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
            status: 'COMPLETED'
        }, { transaction: t });

        for (const item of items) {
            await GRNItem.create({
                grn_id: grn.id,
                product_id: item.product_id,
                warehouse_id: item.warehouse_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.quantity * item.unit_price
            }, { transaction: t });

            // Update product stock - Logic: Add stock when GRN is created
            const product = await Product.findByPk(item.product_id, { transaction: t });
            if (product) {
                product.stock_quantity += parseInt(item.quantity);
                await product.save({ transaction: t });
            }
        }

        await t.commit();
        res.status(201).json(grn);
    } catch (error) {
        await t.rollback();
        res.status(400).json({ message: error.message });
    }
};

export const deleteGRN = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const grn = await GRN.findByPk(req.params.id, {
            include: [GRNItem],
            transaction: t
        });
        if (!grn) return res.status(404).json({ message: 'GRN not found' });

        // Restore stock levels before deleting
        for (const item of grn.GRNItems) {
            const product = await Product.findByPk(item.product_id, { transaction: t });
            if (product) {
                product.stock_quantity -= item.quantity;
                await product.save({ transaction: t });
            }
        }

        await grn.destroy({ transaction: t });
        await t.commit();
        res.json({ message: 'GRN deleted and stock restored' });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};
