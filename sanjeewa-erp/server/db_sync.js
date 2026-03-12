import sequelize from './config/database.js';

import User from './models/user.model.js';
import Warehouse from './models/warehouse.model.js';
import Product from './models/product.model.js';
import Invoice from './models/invoice.model.js';
import InvoiceItem from './models/invoice_item.model.js';

// Sync all defined models to the DB
export const syncDatabase = async () => {
    try {
        // We use { alter: false } to avoid redundant index creation errors on some environments
        await sequelize.sync();
        console.log('Database synced successfully.');
    } catch (error) {
        console.error('Error syncing the database:', error);
    }
};
export {
    sequelize,
    User,
    Warehouse,
    Product,
    Invoice,
    InvoiceItem
};
