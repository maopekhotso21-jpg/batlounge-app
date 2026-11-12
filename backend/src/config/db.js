const mysql = require('mysql2');
require('dotenv').config();

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
  charset: 'utf8mb4',
  ssl: { rejectUnauthorized: false } // THIS IS THE MAGIC LINE FOR TIDB
});

const promisePool = pool.promise();

(async () => {
  try {
    const conn = await promisePool.getConnection();
    await conn.ping();
    conn.release();
    console.log('MySQL pool connected:', process.env.DB_NAME);
  } catch (err) {
    console.error('MySQL connection failed:', err.message);
  }
})();

module.exports = promisePool;