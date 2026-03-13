import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Invoice from './invoice.model.js';

const SalesReturn = sequelize.define('SalesReturn', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    return_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    invoice_id: {
        type: DataTypes.UUID,
        references: {
            model: Invoice,
            key: 'id'
        }
    },
    return_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    total_refund_amount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('COMPLETED', 'CANCELLED'),
        defaultValue: 'COMPLETED'
    }
}, {
    timestamps: true,
    tableName: 'sales_returns'
});

Invoice.hasMany(SalesReturn, { foreignKey: 'invoice_id' });
SalesReturn.belongsTo(Invoice, { foreignKey: 'invoice_id' });

export default SalesReturn;
