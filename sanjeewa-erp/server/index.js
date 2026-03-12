import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as db from './db_sync.js'; // Imports the sync function
import authRoutes from './routes/auth.routes.js';
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

app.listen(PORT, async () => {
  try {
    // Sync the database models
    await db.syncDatabase();
  } catch (error) {
    console.error('Unable to connect or sync to the database:', error);
  }
  console.log(`Server is running on port ${PORT}`);
});
