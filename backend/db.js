const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cam_holdings',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

// Ping helper to test connection
promisePool.ping = async () => {
  try {
    const [rows] = await promisePool.query('SELECT 1');
    return rows.length > 0;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

module.exports = promisePool;
