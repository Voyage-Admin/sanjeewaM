import User from './models/user.model.js';
import Warehouse from './models/warehouse.model.js';
import Product from './models/product.model.js';
import Invoice from './models/invoice.model.js';
import InvoiceItem from './models/invoice_item.model.js';
import Shop from './models/shop.model.js';
import Supplier from './models/supplier.model.js';
import Department from './models/department.model.js';
import SubDepartment from './models/sub_department.model.js';
import Category from './models/category.model.js';
import SubCategory from './models/subcategory.model.js';
import Bin from './models/bin.model.js';
import Rack from './models/rack.model.js';
import GRN from './models/grn.model.js';
import GRNItem from './models/grn_item.model.js';

// Sync all defined models to the DB
export const syncDatabase = async () => {
    try {
        // In development, you might use { alter: true } to update schema without dropping data
        // For fresh starts, use { force: true } (Caution: drops all tables)
        await User.sync({ alter: true });
        await Warehouse.sync({ alter: true });
        await Product.sync({ alter: true });
        await Invoice.sync({ alter: true });
        await InvoiceItem.sync({ alter: true });
        await Shop.sync({ alter: true });
        await Supplier.sync({ alter: true });
        await Department.sync({ alter: true });
        await SubDepartment.sync({ alter: true });
        await Category.sync({ alter: true });
        await SubCategory.sync({ alter: true });
        await Bin.sync({ alter: true });
        await Rack.sync({ alter: true });
        await GRN.sync({ alter: true });
        await GRNItem.sync({ alter: true });
        
        console.log('Database synced successfully');
    } catch (error) {
        console.error('Database sync failed:', error);
    }
};

export {
    User,
    Warehouse,
    Product,
    Invoice,
    InvoiceItem,
    Shop,
    Supplier,
    Department,
    SubDepartment,
    Category,
    SubCategory,
    Bin,
    Rack,
    GRN,
    GRNItem
};
