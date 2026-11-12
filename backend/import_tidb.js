const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');

async function run() {
  console.log("Connecting to TiDB...");
  try {
    const connection = await mysql.createConnection({
      host: 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
      port: 4000,
      user: '2FJvTVQitAAxa41.root',
      password: 'YgFnSrUzm98KRkoq',
      ssl: { rejectUnauthorized: false }, // Crucial for TiDB
      multipleStatements: true
    });

    console.log("Connected! Creating database...");
    await connection.query('CREATE DATABASE IF NOT EXISTS batlounge_db;');
    await connection.query('USE batlounge_db;');

    console.log("Reading schema.sql...");
    const schema = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
    await connection.query(schema);
    console.log("Schema imported!");

    console.log("Reading seed.sql...");
    const seed = fs.readFileSync(path.join(__dirname, 'database', 'seed.sql'), 'utf8');
    await connection.query(seed);
    console.log("Seed data imported!");

    console.log("ALL DONE! Database is ready.");
    await connection.end();
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

run();