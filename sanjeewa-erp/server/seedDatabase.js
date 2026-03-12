import User from './models/user.model.js';
import Warehouse from './models/warehouse.model.js';
import Product from './models/product.model.js';
import bcrypt from 'bcrypt';
import { sequelize } from './db_sync.js';

const seedAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database for seeding...');

        // Seed Users
        const userCount = await User.count();
        if (userCount === 0) {
            const adminPassword = await bcrypt.hash('admin123', 10);
            const refPassword = await bcrypt.hash('ref123', 10);
            
            await User.bulkCreate([
                { name: 'System Admin', email: 'admin@sanjeewa.com', password: adminPassword, role: 'ADMIN' },
                { name: 'Sale Ref 1', email: 'ref@sanjeewa.com', password: refPassword, role: 'REF' }
            ]);
            console.log('✅ Base users seeded');
        }

        // Seed Warehouses
        const warehouseCount = await Warehouse.count();
        let mainWarehouseId;
        if (warehouseCount === 0) {
            const warehouses = await Warehouse.bulkCreate([
                { name: 'Main Warehouse', location: 'Colombo', description: 'Primary storage for large items' },
                { name: 'Downtown Shop', location: 'Kandy', description: 'Retail front and quick storage' }
            ]);
            mainWarehouseId = warehouses[0].id;
            console.log('✅ Warehouses seeded');
        } else {
            const firstWarehouse = await Warehouse.findOne();
            mainWarehouseId = firstWarehouse.id;
        }

        // Seed Products
        const productCount = await Product.count();
        if (productCount === 0) {
            await Product.bulkCreate([
                { sku: 'OIL-5L-ENG', name: 'Engine Oil 5L', price: 8500.00, stock_quantity: 50, warehouse_id: mainWarehouseId },
                { sku: 'BRK-PAD-HON', name: 'Brake Pads (Honda)', price: 4200.00, stock_quantity: 20, warehouse_id: mainWarehouseId },
                { sku: 'AIR-FLT-UNI', name: 'Universal Air Filter', price: 1500.00, stock_quantity: 100, warehouse_id: mainWarehouseId },
                { sku: 'BATT-12V-CAR', name: '12V Car Battery', price: 25000.00, stock_quantity: 5, warehouse_id: mainWarehouseId }
            ]);
            console.log('✅ Initial products seeded');
        }

        console.log('🌱 Seeding process complete');
        process.exit(0);
    } catch (error) {
        console.error('Failed to seed DB:', error);
        process.exit(1);
    }
};

seedAdmin();
