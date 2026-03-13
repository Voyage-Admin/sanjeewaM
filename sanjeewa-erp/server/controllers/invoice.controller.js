import Invoice from '../models/invoice.model.js';
import InvoiceItem from '../models/invoice_item.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';
import Warehouse from '../models/warehouse.model.js';
import sequelize from '../config/database.js';

export const getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.findAll({
            include: [
                { model: User, attributes: ['name', 'email'] },
                { model: Warehouse, attributes: ['name'] },
                { 
                    model: InvoiceItem, 
                    as: 'items',
                    include: [{ model: Product, attributes: ['name', 'sku'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [
                { model: User, attributes: ['name', 'email'] },
                { model: Warehouse, attributes: ['name'] },
                { 
                    model: InvoiceItem, 
                    as: 'items',
                    include: [{ model: Product, attributes: ['name', 'sku'] }]
                }
            ]
        });
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createInvoice = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { shop_id, items, discount_percentage, paid_amount, due_date } = req.body;
        const user_id = req.user.id;

        // Generate Invoice Number (e.g., INV-YYYYMMDD-XXXX)
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const count = await Invoice.count() + 1;
        const invoice_number = `INV-${date}-${count.toString().padStart(4, '0')}`;

        let total_amount = 0;
        const invoiceItems = [];

        for (const item of items) {
            const product = await Product.findByPk(item.product_id, { transaction: t });
            if (!product) throw new Error(`Product ${item.product_id} not found`);
            
            if (product.stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for product ${product.name}`);
            }

            const itemSubtotal = product.price * item.quantity;
            total_amount += itemSubtotal;

            // Deduct stock
            product.stock_quantity -= item.quantity;
            await product.save({ transaction: t });

            invoiceItems.push({
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: product.price,
                subtotal: itemSubtotal
            });
        }

        // Apply discount
        const discountAmount = total_amount * (discount_percentage / 100);
        const finalTotal = total_amount - discountAmount;

        const invoice = await Invoice.create({
            invoice_number,
            total_amount: finalTotal,
            discount_percentage,
            paid_amount,
            status: paid_amount >= finalTotal ? 'APPROVED' : 'PENDING',
            due_date,
            user_id,
            shop_id
        }, { transaction: t });

        for (const item of invoiceItems) {
            await InvoiceItem.create({
                ...item,
                invoice_id: invoice.id
            }, { transaction: t });
        }

        await t.commit();
        res.status(201).json(invoice);
    } catch (error) {
        await t.rollback();
        res.status(400).json({ message: error.message });
    }
};

export const updateInvoiceStatus = async (req, res) => {
    try {
        const { status, paid_amount } = req.body;
        const invoice = await Invoice.findByPk(req.params.id);
        
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        
        if (status) invoice.status = status;
        if (paid_amount !== undefined) invoice.paid_amount = paid_amount;
        
        await invoice.save();
        res.json(invoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteInvoice = async (req, res) => {
    // Note: Deleting an invoice should ideally restore stock or just be cancelled
    const t = await sequelize.transaction();
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [{ model: InvoiceItem, as: 'items' }]
        });
        
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

        // Restore stock if it's not already cancelled
        if (invoice.status !== 'CANCELLED') {
            for (const item of invoice.items) {
                const product = await Product.findByPk(item.product_id, { transaction: t });
                if (product) {
                    product.stock_quantity += item.quantity;
                    await product.save({ transaction: t });
                }
            }
        }

        await invoice.destroy({ transaction: t });
        await t.commit();
        res.json({ message: 'Invoice deleted and stock restored' });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};
