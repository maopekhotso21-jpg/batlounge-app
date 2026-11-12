// Imports the MySQL driver used to create the database connection pool.
const mysql = require('mysql2');
// Loads database settings from the backend .env file into process.env.
require('dotenv').config();

// A pool reuses a limited number of database connections across requests.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Batloung_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  charset: 'utf8mb4'
});

// The promise wrapper lets controllers use async/await with database queries.
const promisePool = pool.promise();

// Test one pooled connection when the application starts, then return it.
(async () => {
  try {
    const conn = await promisePool.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ MySQL pool connected:', process.env.DB_NAME);
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
  }
})();

// Controllers import this shared promise-based pool for all SQL operations.
module.exports = promisePool;