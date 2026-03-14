import User from './models/user.model.js';
import Warehouse from './models/warehouse.model.js';
import Product from './models/product.model.js';
import Shop from './models/shop.model.js';
import Supplier from './models/supplier.model.js';
import Category from './models/category.model.js';
import SubCategory from './models/subcategory.model.js';
import Department from './models/department.model.js';
import SubDepartment from './models/sub_department.model.js';
import Rack from './models/rack.model.js';
import Bin from './models/bin.model.js';
import GRN from './models/grn.model.js';
import GRNItem from './models/grn_item.model.js';
import Invoice from './models/invoice.model.js';
import InvoiceItem from './models/invoice_item.model.js';
import Payment from './models/payment.model.js';
import FinancialEntry from './models/financial_entry.model.js';
import SalesReturn from './models/sales_return.model.js';
import SalesReturnItem from './models/sales_return_item.model.js';
import SupplierReturn from './models/supplier_return.model.js';
import SupplierReturnItem from './models/supplier_return_item.model.js';
import bcrypt from 'bcrypt';
import { sequelize } from './db_sync.js';

const seedCompleteData = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected for Complete Seeding...');

        // Fresh Start
        await sequelize.sync({ force: true });
        console.log('Database wiped and recreated.');

        // 1. Warehouses (4)
        const warehouses = await Warehouse.bulkCreate([
            { name: 'Main Warehouse - Colombo', location: 'Colombo 01', description: 'Central Hub' },
            { name: 'Northern Hub - Jaffna', location: 'Jaffna', description: 'Northern province storage' },
            { name: 'Hill Country Store - Kandy', location: 'Kandy', description: 'Central distribution' },
            { name: 'Southern Depot - Galle', location: 'Galle', description: 'Southern port logistics' }
        ]);

        // 2. Users (1 Admin + 9 Refs)
        const adminPassword = await bcrypt.hash('admin123', 10);
        const refPassword = await bcrypt.hash('ref123', 10);
        const users = await User.bulkCreate([
            { name: 'System Admin', email: 'admin@sanjeewa.com', password: adminPassword, role: 'ADMIN' },
            ...Array.from({ length: 9 }).map((_, i) => ({
                name: `Sales Ref ${i + 1}`,
                email: `ref${i + 1}@sanjeewa.com`,
                password: refPassword,
                role: 'REF',
                credit_limit: 100000.00
            }))
        ]);

        // 3. Categories & Sub-Categories (10 each)
        const categories = await Category.bulkCreate(
            Array.from({ length: 10 }).map((_, i) => ({ name: `Category ${i + 1}`, description: `Main group ${i + 1}` }))
        );
        for (const cat of categories) {
            await SubCategory.bulkCreate([
                { name: `${cat.name} - Alpha`, category_id: cat.id },
                { name: `${cat.name} - Beta`, category_id: cat.id }
            ]);
        }

        // 4. Departments & Sub-Departments (10 each)
        const departments = await Department.bulkCreate(
            Array.from({ length: 10 }).map((_, i) => ({ name: `Dept ${i + 1}`, description: `Division ${i + 1}` }))
        );
        for (const dept of departments) {
            await SubDepartment.bulkCreate([
                { name: `${dept.name} Operations`, department_id: dept.id }
            ]);
        }

        // 5. Suppliers & Shops (10 each)
        const suppliers = await Supplier.bulkCreate(
            Array.from({ length: 10 }).map((_, i) => ({
                name: `Supplier Co ${i + 1}`,
                contact_person: `Agent ${i + 1}`,
                email: `supplier${i + 1}@example.com`,
                phone: `011223344${i}`,
                address: `Industrial Road, Area ${i + 1}`
            }))
        );
        const shops = await Shop.bulkCreate(
            Array.from({ length: 10 }).map((_, i) => ({
                name: `Retail Shop ${i + 1}`,
                phone: `077123456${i}`,
                address: `Main Street, City ${i + 1}`
            }))
        );

        // 6. Products (20)
        const partTypes = ['Engine Oil', 'Brake Pad', 'Filter', 'Battery', 'Tire'];
        const brands = ['Toyota', 'Honda', 'Nissan', 'Mazda'];
        const products = [];
        for (let i = 1; i <= 20; i++) {
            const part = partTypes[Math.floor(Math.random() * partTypes.length)];
            const brand = brands[Math.floor(Math.random() * brands.length)];
            products.push(await Product.create({
                sku: `SKU-${i.toString().padStart(3, '0')}-${brand.substring(0, 3).toUpperCase()}`,
                name: `${part} (${brand})`,
                price: (Math.random() * 5000 + 500).toFixed(2),
                stock_quantity: 100,
                warehouse_id: warehouses[Math.floor(Math.random() * warehouses.length)].id
            }));
        }

        // 7. Racks & Bins (10 each)
        for (let i = 1; i <= 10; i++) {
            await Rack.create({ name: `Rack ${i}`, warehouse_id: warehouses[i % 4].id });
            await Bin.create({ name: `Bin ${i}`, warehouse_id: warehouses[i % 4].id });
        }

        // 8. Transactional Discovery Data (10 GRNs & 10 Invoices)
        console.log('Seeding Transactions...');
        for (let i = 1; i <= 10; i++) {
            // GRN
            const grn = await GRN.create({
                grn_number: `GRN-2024-${i.toString().padStart(4, '0')}`,
                supplier_id: suppliers[i - 1].id,
                status: 'COMPLETED',
                receive_date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000))
            });
            let grnTotal = 0;
            for (let j = 0; j < 3; j++) {
                const prod = products[Math.floor(Math.random() * products.length)];
                const qty = 20;
                const price = prod.price * 0.8; // Buying price
                await GRNItem.create({
                    grn_id: grn.id,
                    product_id: prod.id,
                    warehouse_id: prod.warehouse_id,
                    quantity: qty,
                    unit_price: price,
                    total_price: qty * price
                });
                grnTotal += (qty * price);
            }
            await grn.update({ total_amount: grnTotal });

            // Invoice
            const invoice = await Invoice.create({
                invoice_number: `INV-24-${i.toString().padStart(4, '0')}`,
                total_amount: 0,
                status: i % 2 === 0 ? 'PAID' : 'PARTIAL',
                user_id: users[Math.floor(Math.random() * users.length)].id,
                shop_id: warehouses[Math.floor(Math.random() * warehouses.length)].id,
                due_date: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000))
            });
            let invTotal = 0;
            for (let j = 0; j < 2; j++) {
                const prod = products[Math.floor(Math.random() * products.length)];
                const qty = 2;
                await InvoiceItem.create({
                    invoice_id: invoice.id,
                    product_id: prod.id,
                    quantity: qty,
                    unit_price: prod.price,
                    subtotal: qty * prod.price
                });
                invTotal += (qty * prod.price);
            }
            await invoice.update({ 
                total_amount: invTotal,
                paid_amount: i % 2 === 0 ? invTotal : (invTotal / 2)
            });

            // Payment for Invoice
            if (invoice.paid_amount > 0) {
                await Payment.create({
                    invoice_id: invoice.id,
                    amount: invoice.paid_amount,
                    payment_method: 'CASH',
                    note: 'System generated seed payment'
                });
            }

            // Financial Entry
            await FinancialEntry.create({
                type: 'INCOME',
                category: 'Sales',
                amount: invoice.paid_amount,
                description: `Sale from Invoice ${invoice.invoice_number}`,
                reference_number: invoice.invoice_number,
                invoice_id: invoice.id
            });
            await FinancialEntry.create({
                type: 'EXPENSE',
                category: 'Purchase',
                amount: grnTotal,
                description: `Payment for GRN ${grn.grn_number}`,
                reference_number: grn.grn_number,
                grn_id: grn.id
            });
        }

        // 9. Returns (3 Sales Returns)
        for (let i = 1; i <= 3; i++) {
            const inv = await Invoice.findOne();
            const sReturn = await SalesReturn.create({
                return_number: `SR-24-00${i}`,
                invoice_id: inv.id,
                return_date: new Date(),
                total_amount: 1000.00
            });
            
            await FinancialEntry.create({
                type: 'EXPENSE',
                category: 'Sales Return',
                amount: 1000.00,
                description: `Refund for Sales Return ${sReturn.return_number}`,
                reference_number: sReturn.return_number,
                sales_return_id: sReturn.id,
                invoice_id: inv.id
            });
            // We'll skip item details for returns to keep it simple but functional
        }

        console.log('🌱 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
        process.exit(0);
    } catch (error) {
        console.error('FAILED SEEDING:', error);
        process.exit(1);
    }
};

seedCompleteData();
