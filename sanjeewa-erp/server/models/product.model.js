import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Warehouse from './warehouse.model.js';

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    stock_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    low_stock_threshold: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
    },
    warehouse_id: {
        type: DataTypes.UUID,
        references: {
            model: Warehouse,
            key: 'id'
        }
    }
}, {
    timestamps: true,
    tableName: 'products'
});

// Associations
Warehouse.hasMany(Product, { foreignKey: 'warehouse_id' });
Product.belongsTo(Warehouse, { foreignKey: 'warehouse_id' });

export default Product;
