import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Supplier from './supplier.model.js';

const GRN = sequelize.define('GRN', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    grn_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    receive_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    supplier_id: {
        type: DataTypes.UUID,
        references: {
            model: Supplier,
            key: 'id'
        }
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    status: {
        type: DataTypes.ENUM('DRAFT', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'COMPLETED'
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'grns'
});

Supplier.hasMany(GRN, { foreignKey: 'supplier_id' });
GRN.belongsTo(Supplier, { foreignKey: 'supplier_id' });

export default GRN;
