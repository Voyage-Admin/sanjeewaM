import sequelize from '../config/database.js';
import { 
    SalesReturn, 
    SalesReturnItem, 
    SupplierReturn, 
    SupplierReturnItem, 
    Invoice, 
    GRN, 
    Product 
} from '../db_sync.js';

// --- Sales Returns ---

export const getAllSalesReturns = async (req, res) => {
    try {
        const returns = await SalesReturn.findAll({
            include: [{ model: Invoice, attributes: ['invoice_number'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(returns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createSalesReturn = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { invoice_id, return_number, items, reason } = req.body;

        const salesReturn = await SalesReturn.create({
            invoice_id,
            return_number,
            reason,
            total_refund_amount: items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0)
        }, { transaction: t });

        for (const item of items) {
            await SalesReturnItem.create({
                sales_return_id: salesReturn.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal: item.quantity * item.unit_price
            }, { transaction: t });

            // Restore Stock
            const product = await Product.findByPk(item.product_id, { transaction: t });
            if (product) {
                product.stock_quantity += parseInt(item.quantity);
                await product.save({ transaction: t });
            }
        }

        await t.commit();
        res.status(201).json(salesReturn);
    } catch (error) {
        await t.rollback();
        res.status(400).json({ message: error.message });
    }
};

// --- Supplier Returns ---

export const getAllSupplierReturns = async (req, res) => {
    try {
        const returns = await SupplierReturn.findAll({
            include: [{ model: GRN, attributes: ['grn_number'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(returns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createSupplierReturn = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { grn_id, return_number, items, reason } = req.body;

        const supplierReturn = await SupplierReturn.create({
            grn_id,
            return_number,
            reason,
            total_credit_amount: items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0)
        }, { transaction: t });

        for (const item of items) {
            await SupplierReturnItem.create({
                supplier_return_id: supplierReturn.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal: item.quantity * item.unit_price
            }, { transaction: t });

            // Reduce Stock
            const product = await Product.findByPk(item.product_id, { transaction: t });
            if (product) {
                if (product.stock_quantity < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}`);
                }
                product.stock_quantity -= parseInt(item.quantity);
                await product.save({ transaction: t });
            }
        }

        await t.commit();
        res.status(201).json(supplierReturn);
    } catch (error) {
        await t.rollback();
        res.status(400).json({ message: error.message });
    }
};
