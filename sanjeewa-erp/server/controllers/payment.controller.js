import sequelize from '../config/database.js';
import { Payment, Invoice, FinancialEntry } from '../db_sync.js';

export const createPayment = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { invoice_id, amount, payment_method, payment_date, note } = req.body;
        
        const invoice = await Invoice.findByPk(invoice_id, { transaction: t });
        if (!invoice) {
            await t.rollback();
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const payment = await Payment.create({
            invoice_id,
            amount,
            payment_method,
            payment_date,
            note
        }, { transaction: t });

        // Update invoice paid amount
        const newPaidAmount = Number(invoice.paid_amount) + Number(amount);
        invoice.paid_amount = newPaidAmount;

        // Update status
        if (newPaidAmount >= Number(invoice.total_amount)) {
            invoice.status = 'PAID';
        } else if (newPaidAmount > 0) {
            invoice.status = 'PARTIAL';
        }

        await invoice.save({ transaction: t });
        
        // Create linked Financial Entry
        await FinancialEntry.create({
            type: 'INCOME',
            category: 'Sales Payment',
            amount: amount,
            description: `Payment for Invoice ${invoice.invoice_number}`,
            reference_number: invoice.invoice_number,
            invoice_id: invoice.id,
            payment_id: payment.id,
            payment_method: payment_method,
            entry_date: payment_date || new Date()
        }, { transaction: t });

        await t.commit();

        res.status(201).json(payment);
    } catch (error) {
        await t.rollback();
        res.status(400).json({ message: error.message });
    }
};

export const getPaymentsByInvoice = async (req, res) => {
    try {
        const payments = await Payment.findAll({
            where: { invoice_id: req.params.invoiceId },
            order: [['createdAt', 'DESC']]
        });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePayment = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const payment = await Payment.findByPk(req.params.id, { transaction: t });
        if (!payment) {
            await t.rollback();
            return res.status(404).json({ message: 'Payment not found' });
        }

        const invoice = await Invoice.findByPk(payment.invoice_id, { transaction: t });
        if (invoice) {
            const newPaidAmount = Number(invoice.paid_amount) - Number(payment.amount);
            invoice.paid_amount = newPaidAmount;

            if (newPaidAmount <= 0) {
                invoice.status = 'PENDING';
            } else if (newPaidAmount < Number(invoice.total_amount)) {
                invoice.status = 'PARTIAL';
            }
            await invoice.save({ transaction: t });
        }

        await payment.destroy({ transaction: t });
        await t.commit();
        res.json({ message: 'Payment deleted and invoice updated' });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};
