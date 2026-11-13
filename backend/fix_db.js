const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function fix() {
  console.log("Connecting to TiDB...");
  try {
    const conn = await mysql.createConnection({
      host: 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
      port: 4000,
      user: '2FJvTVQitAAxa41.root',
      password: 'YgFnSrUzm98KRkoq',
      ssl: { rejectUnauthorized: false },
      multipleStatements: true
    });

    console.log("Connected! Dropping old database and creating fresh one...");
    await conn.query('DROP DATABASE IF EXISTS batlounge_db;');
    await conn.query('CREATE DATABASE batlounge_db;');
    await conn.query('USE batlounge_db;');

    console.log("Running schema.sql (creating tables)...");
    const schema = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
    const cleanSchema = schema.replace(/DROP DATABASE.*?;/gi, '').replace(/CREATE DATABASE.*?;/gi, '').replace(/USE .*?;/gi, '');
    await conn.query(cleanSchema);
    
    console.log("Running seed.sql (inserting data)...");
    const seed = fs.readFileSync(path.join(__dirname, 'database', 'seed.sql'), 'utf8');
    await conn.query(seed);

    console.log("SUCCESS! All tables created and data inserted.");
    await conn.end();
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

fix();