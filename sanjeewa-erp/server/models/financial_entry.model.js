import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FinancialEntry = sequelize.define('FinancialEntry', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    type: {
        type: DataTypes.ENUM('INCOME', 'EXPENSE'),
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING, // e.g., 'Salaries', 'Rent', 'Sales', 'Direct'
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    entry_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    payment_method: {
        type: DataTypes.ENUM('CASH', 'CARD', 'CHEQUE', 'TRANSFER'),
        defaultValue: 'CASH',
    },
    reference_number: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    timestamps: true,
    tableName: 'financial_entries'
});

export default FinancialEntry;
