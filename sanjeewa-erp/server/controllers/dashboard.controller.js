import Invoice from '../models/invoice.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';
import Warehouse from '../models/warehouse.model.js';
import { Sequelize } from 'sequelize';

export const getStats = async (req, res) => {
    try {
        const totalSales = await Invoice.sum('total_amount') || 0;
        const totalPaid = await Invoice.sum('paid_amount') || 0;
        const userCount = await User.count();
        const productCount = await Product.count();
        const invoiceCount = await Invoice.count();

        // Sales for the last 7 days for the chart
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const salesByDay = await Invoice.findAll({
            attributes: [
                [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
                [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'total']
            ],
            where: {
                createdAt: {
                    [Sequelize.Op.gte]: sevenDaysAgo
                }
            },
            group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
            order: [[Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']]
        });

        // Recent Activity
        const recentInvoices = await Invoice.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [{ model: User, attributes: ['name'] }]
        });

        res.json({
            totalSales,
            totalPaid,
            userCount,
            productCount,
            invoiceCount,
            salesByDay: salesByDay.map(s => ({
                name: new Date(s.getDataValue('date')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                sales: parseFloat(s.getDataValue('total'))
            })),
            recentActivity: recentInvoices.map(inv => ({
                id: inv.id,
                type: 'Invoice',
                desc: `New invoice ${inv.invoice_number} created`,
                time: new Date(inv.createdAt).toLocaleString(),
                user: inv.User.name
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
