import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as db from './db_sync.js'; // Imports the sync function
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import warehouseRoutes from './routes/warehouse.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import userManagementRoutes from './routes/user.management.routes.js';
import shopRoutes from './routes/shop.routes.js';
import supplierRoutes from './routes/supplier.routes.js';
import masterRoutes from './routes/master.routes.js';
import grnRoutes from './routes/grn.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import returnRoutes from './routes/return.routes.js';
import financialRoutes from './routes/financial.routes.js';
import { setupSwagger } from './swagger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Setup Swagger
setupSwagger(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sanjeewa ERP Server is running' });
});

// Mount Routes
app.use('/api/users', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users-manage', userManagementRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/grns', grnRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/financials', financialRoutes);

app.listen(PORT, async () => {
  try {
    // Sync the database models
    await db.syncDatabase();
  } catch (error) {
    console.error('Unable to connect or sync to the database:', error);
  }
  console.log(`Server is running on port ${PORT}`);
});
