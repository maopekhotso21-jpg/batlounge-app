// Provides the shared promise-based MySQL connection pool.
const db = require('../config/db');
// Sends asynchronous failures to the central Express error handler.
const asyncHandler = require('../utils/asyncHandler');
// Validates supplier fields and creates HTTP-aware errors.
const {
  isValidProvince, isNonEmptyString, isValidEmail, isValidPhone, assert
} = require('../utils/validators');

// Lists suppliers with optional name, province, and status filters.
exports.getAll = asyncHandler(async (req, res) => {
  const { search = '', province, status } = req.query;
  let sql = 'SELECT * FROM suppliers WHERE 1=1';
  const params = [];
  if (search) { sql += ' AND supplier_name LIKE ?'; params.push(`%${search}%`); }
  if (province) { sql += ' AND province=?'; params.push(province); }
  if (status) { sql += ' AND status=?'; params.push(status); }
  sql += ' ORDER BY supplier_name ASC';
  const [rows] = await db.query(sql, params);
  res.json(rows);
});

// Retrieves one supplier by its database ID.
exports.getOne = asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM suppliers WHERE supplier_id=?', [req.params.id]);
  assert(rows.length > 0, 'Supplier not found', 404);
  res.json(rows[0]);
});

// Validates supplier contact data and inserts a new supplier.
exports.create = asyncHandler(async (req, res) => {
  const {
    supplier_name, province, contact_person, telephone, email,
    physical_address, status = 'Active'
  } = req.body;

  assert(isNonEmptyString(supplier_name), 'Supplier name is required');
  assert(isValidProvince(province), 'Invalid South African province');
  if (email) assert(isValidEmail(email), 'Invalid email');
  if (telephone) assert(isValidPhone(telephone), 'Invalid telephone');
  assert(['Active', 'Inactive'].includes(status), 'Invalid status');

  const [result] = await db.query(
    `INSERT INTO suppliers
     (supplier_name, province, contact_person, telephone, email, physical_address, status)
     VALUES (?,?,?,?,?,?,?)`,
    [supplier_name.trim(), province, contact_person || null, telephone || null,
     email || null, physical_address || null, status]
  );
  res.status(201).json({ supplier_id: result.insertId });
});

// Validates and updates an existing supplier record.
exports.update = asyncHandler(async (req, res) => {
  const {
    supplier_name, province, contact_person, telephone, email,
    physical_address, status = 'Active'
  } = req.body;
  assert(isNonEmptyString(supplier_name), 'Supplier name is required');
  assert(isValidProvince(province), 'Invalid province');
  if (email) assert(isValidEmail(email), 'Invalid email');

  const [result] = await db.query(
    `UPDATE suppliers SET supplier_name=?, province=?, contact_person=?,
     telephone=?, email=?, physical_address=?, status=?
     WHERE supplier_id=?`,
    [supplier_name, province, contact_person || null, telephone || null,
     email || null, physical_address || null, status, req.params.id]
  );
  assert(result.affectedRows > 0, 'Supplier not found', 404);
  res.json({ message: 'Supplier updated' });
});

// Deletes a supplier and reports an error when its ID does not exist.
exports.remove = asyncHandler(async (req, res) => {
  const [result] = await db.query('DELETE FROM suppliers WHERE supplier_id=?', [req.params.id]);
  assert(result.affectedRows > 0, 'Supplier not found', 404);
  res.json({ message: 'Supplier deleted' });
});
