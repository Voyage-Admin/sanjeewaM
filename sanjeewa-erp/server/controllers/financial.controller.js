import { FinancialEntry } from '../db_sync.js';
import { Op } from 'sequelize';

export const getAllFinancialEntries = async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;
        let where = {};

        if (startDate && endDate) {
            where.entry_date = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        if (type) {
            where.type = type;
        }

        const entries = await FinancialEntry.findAll({
            where,
            order: [['entry_date', 'DESC']]
        });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createFinancialEntry = async (req, res) => {
    try {
        const entry = await FinancialEntry.create(req.body);
        res.status(201).json(entry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getFinancialSummary = async (req, res) => {
    try {
        const income = await FinancialEntry.sum('amount', { where: { type: 'INCOME' } }) || 0;
        const expense = await FinancialEntry.sum('amount', { where: { type: 'EXPENSE' } }) || 0;
        
        res.json({
            total_income: income,
            total_expense: expense,
            net_profit: income - expense
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteFinancialEntry = async (req, res) => {
    try {
        const entry = await FinancialEntry.findByPk(req.params.id);
        if (!entry) return res.status(404).json({ message: 'Entry not found' });
        await entry.destroy();
        res.json({ message: 'Entry deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
