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
import Payment from './models/payment.model.js';
import SalesReturn from './models/sales_return.model.js';
import SalesReturnItem from './models/sales_return_item.model.js';
import SupplierReturn from './models/supplier_return.model.js';
import SupplierReturnItem from './models/supplier_return_item.model.js';
import FinancialEntry from './models/financial_entry.model.js';
import sequelize from './config/database.js';

// Financial Entry Associations
FinancialEntry.belongsTo(Invoice, { foreignKey: 'invoice_id' });
FinancialEntry.belongsTo(GRN, { foreignKey: 'grn_id' });
FinancialEntry.belongsTo(Payment, { foreignKey: 'payment_id' });
FinancialEntry.belongsTo(SalesReturn, { foreignKey: 'sales_return_id' });
FinancialEntry.belongsTo(SupplierReturn, { foreignKey: 'supplier_return_id' });

Invoice.hasMany(FinancialEntry, { foreignKey: 'invoice_id' });
GRN.hasMany(FinancialEntry, { foreignKey: 'grn_id' });
Payment.hasOne(FinancialEntry, { foreignKey: 'payment_id' });
SalesReturn.hasOne(FinancialEntry, { foreignKey: 'sales_return_id' });
SupplierReturn.hasOne(FinancialEntry, { foreignKey: 'supplier_return_id' });


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
        await Payment.sync({ alter: true });
        await SalesReturn.sync({ alter: true });
        await SalesReturnItem.sync({ alter: true });
        await SupplierReturn.sync({ alter: true });
        await SupplierReturnItem.sync({ alter: true });
        await FinancialEntry.sync({ alter: true });
        
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
    GRNItem,
    Payment,
    SalesReturn,
    SalesReturnItem,
    SupplierReturn,
    SupplierReturnItem,
    FinancialEntry,
    sequelize
};

