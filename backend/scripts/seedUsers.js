// Usage: npm run seed:users (after DB + tables exist)
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

(async () => {
  try {
    const adminHash = await bcrypt.hash('admin123', 10);
    const salesHash = await bcrypt.hash('sales123', 10);

    await db.query(
      `INSERT INTO users (username, password_hash, role)
       VALUES (?,?,?),(?,?,?)
       ON DUPLICATE KEY UPDATE
         password_hash = VALUES(password_hash),
         role = VALUES(role)`,
      ['admin', adminHash, 'Admin', 'sales', salesHash, 'Sales']
    );
    console.log('✅ Seeded users: admin/admin123, sales/sales123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
})();