import sequelize from './config/database.js';

import User from './models/user.model.js';
import Warehouse from './models/warehouse.model.js';
import Product from './models/product.model.js';
import Invoice from './models/invoice.model.js';
import InvoiceItem from './models/invoice_item.model.js';

// Sync all defined models to the DB
export const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully. All models created/updated.');
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
