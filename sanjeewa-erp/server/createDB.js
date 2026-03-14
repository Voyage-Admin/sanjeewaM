import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();


async function createDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS !== undefined ? process.env.DB_PASS : '19960327'
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'sanjeewa_erp'}\`;`);
    console.log(`Database '${process.env.DB_NAME}' created or successfully checked.`);
    await connection.end();
  } catch (error) {
    console.error('Error creating database:', error.message);
  }
}

createDatabase();
