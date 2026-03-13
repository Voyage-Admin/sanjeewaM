import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Invoice from './invoice.model.js';

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    invoice_id: {
        type: DataTypes.UUID,
        references: {
            model: Invoice,
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    payment_method: {
        type: DataTypes.ENUM('CASH', 'CARD', 'CHEQUE', 'TRANSFER'),
        defaultValue: 'CASH',
    },
    payment_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    timestamps: true,
    tableName: 'payments'
});

Invoice.hasMany(Payment, { foreignKey: 'invoice_id' });
Payment.belongsTo(Invoice, { foreignKey: 'invoice_id' });

export default Payment;
