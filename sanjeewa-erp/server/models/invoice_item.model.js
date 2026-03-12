import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Invoice from './invoice.model.js';
import Product from './product.model.js';

const InvoiceItem = sequelize.define('InvoiceItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    invoice_id: {
        type: DataTypes.UUID,
        references: {
            model: Invoice,
            key: 'id'
        }
    },
    product_id: {
        type: DataTypes.UUID,
        references: {
            model: Product,
            key: 'id'
        }
    }
}, {
    timestamps: true,
    tableName: 'invoice_items'
});

// Associations
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoice_id', as: 'items' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoice_id' });

Product.hasMany(InvoiceItem, { foreignKey: 'product_id' });
InvoiceItem.belongsTo(Product, { foreignKey: 'product_id' });

export default InvoiceItem;
