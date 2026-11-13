require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const app = require('./app');
const PORT = process.env.PORT || 5000;

async function autoImport() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
      multipleStatements: true
    });
    await conn.query('CREATE DATABASE IF NOT EXISTS ' + process.env.DB_NAME + ';');
    await conn.query('USE ' + process.env.DB_NAME + ';');
    const [tables] = await conn.query('SHOW TABLES;');
    if (tables.length === 0) {
      console.log('Importing schema...');
      const schema = fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8');
      await conn.query(schema);
      console.log('Importing seed...');
      const seed = fs.readFileSync(path.join(__dirname, '..', 'database', 'seed.sql'), 'utf8');
      await conn.query(seed);
      console.log('Database imported successfully!');
    } else {
      console.log('Tables already exist.');
    }
    await conn.end();
  } catch (err) {
    console.error('Import failed:', err.message);
  }
}

<<<<<<< HEAD
const startServer = async () => {
  if (process.env.AUTO_IMPORT !== 'false') await autoImport();

  const server = app.listen(PORT, () => console.log('API running on port ' + PORT));
  process.on('unhandledRejection', (err) => console.error('Unhandled Rejection:', err));
  process.on('uncaughtException', (err) => { console.error('Uncaught Exception:', err); server.close(() => process.exit(1)); });
};

startServer();
=======
autoImport().then(() => {
  const server = app.listen(PORT, () => console.log('API running on port ' + PORT));
  process.on('unhandledRejection', (err) => console.error('Unhandled Rejection:', err));
  process.on('uncaughtException', (err) => { console.error('Uncaught Exception:', err); server.close(() => process.exit(1)); });
});
>>>>>>> 9eb0d96ef5a0b1fe3d8fd7867d536603b82fa08d
