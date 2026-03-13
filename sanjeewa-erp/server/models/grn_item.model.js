import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import GRN from './grn.model.js';
import Product from './product.model.js';
import Warehouse from './warehouse.model.js';

const GRNItem = sequelize.define('GRNItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    grn_id: {
        type: DataTypes.UUID,
        references: {
            model: GRN,
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
    warehouse_id: {
        type: DataTypes.UUID,
        references: {
            model: Warehouse,
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    }
}, {
    timestamps: false,
    tableName: 'grn_items'
});

GRN.hasMany(GRNItem, { foreignKey: 'grn_id' });
GRNItem.belongsTo(GRN, { foreignKey: 'grn_id' });

Product.hasMany(GRNItem, { foreignKey: 'product_id' });
GRNItem.belongsTo(Product, { foreignKey: 'product_id' });

Warehouse.hasMany(GRNItem, { foreignKey: 'warehouse_id' });
GRNItem.belongsTo(Warehouse, { foreignKey: 'warehouse_id' });

export default GRNItem;
