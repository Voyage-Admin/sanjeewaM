import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.model.js';
import Warehouse from './warehouse.model.js'; // Represents the Shop/Warehouse the invoice was made from

const Invoice = sequelize.define('Invoice', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    invoice_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    discount_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
    },
    paid_amount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'PARTIAL', 'PAID', 'APPROVED', 'CANCELLED'),
        defaultValue: 'PENDING',
    },
    due_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    user_id: {
        type: DataTypes.UUID,
        references: {
            model: User,
            key: 'id'
        }
    },
    shop_id: {
        type: DataTypes.UUID,
        references: {
            model: Warehouse,
            key: 'id'
        }
    }
}, {
    timestamps: true,
    tableName: 'invoices'
});

// Associations
User.hasMany(Invoice, { foreignKey: 'user_id' });
Invoice.belongsTo(User, { foreignKey: 'user_id' });

Warehouse.hasMany(Invoice, { foreignKey: 'shop_id' });
Invoice.belongsTo(Warehouse, { foreignKey: 'shop_id' });

export default Invoice;
