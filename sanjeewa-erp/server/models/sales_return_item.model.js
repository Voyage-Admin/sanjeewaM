import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import SalesReturn from './sales_return.model.js';
import Product from './product.model.js';

const SalesReturnItem = sequelize.define('SalesReturnItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    sales_return_id: {
        type: DataTypes.UUID,
        references: {
            model: SalesReturn,
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
    tableName: 'sales_return_items'
});

SalesReturn.hasMany(SalesReturnItem, { foreignKey: 'sales_return_id' });
SalesReturnItem.belongsTo(SalesReturn, { foreignKey: 'sales_return_id' });

export default SalesReturnItem;
