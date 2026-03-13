import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import SupplierReturn from './supplier_return.model.js';
import Product from './product.model.js';

const SupplierReturnItem = sequelize.define('SupplierReturnItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    supplier_return_id: {
        type: DataTypes.UUID,
        references: {
            model: SupplierReturn,
            key: 'id'
        }
    },
    product_id: {
        type: DataTypes.UUID,
        references: {
            model: Product,
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    unit_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    }
}, {
    timestamps: false,
    tableName: 'supplier_return_items'
});

SupplierReturn.hasMany(SupplierReturnItem, { foreignKey: 'supplier_return_id' });
SupplierReturnItem.belongsTo(SupplierReturn, { foreignKey: 'supplier_return_id' });

export default SupplierReturnItem;
