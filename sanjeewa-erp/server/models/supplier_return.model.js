import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import GRN from './grn.model.js';

const SupplierReturn = sequelize.define('SupplierReturn', {
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
    grn_id: {
        type: DataTypes.UUID,
        references: {
            model: GRN,
            key: 'id'
        }
    },
    return_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    total_credit_amount: {
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
    tableName: 'supplier_returns'
});

GRN.hasMany(SupplierReturn, { foreignKey: 'grn_id' });
SupplierReturn.belongsTo(GRN, { foreignKey: 'grn_id' });

export default SupplierReturn;
