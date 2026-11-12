// Provides the shared promise-based MySQL connection pool.
const db = require('../config/db');
// Sends asynchronous failures to the central Express error handler.
const asyncHandler = require('../utils/asyncHandler');
// Validates vendor names and telephone numbers.
const { isNonEmptyString, isValidPhone, assert } = require('../utils/validators');

// Lists vendors with optional name, business, status, registration-date and registration-state filters.
exports.getAll = asyncHandler(async (req, res) => {
  const { search = '', status, registered, registration_date } = req.query;
  let sql = 'SELECT * FROM street_vendors WHERE 1=1';
  const params = [];
  if (search) {
    sql += ' AND (vendor_name LIKE ? OR business_name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status) { sql += ' AND status=?'; params.push(status); }
  if (registered === 'true' || registered === '1') {
    sql += ' AND registration_date IS NOT NULL';
  } else if (registered === 'false' || registered === '0') {
    sql += ' AND registration_date IS NULL';
  }
  if (registration_date) {
    sql += ' AND DATE(registration_date)=?';
    params.push(registration_date);
  }
  sql += ' ORDER BY vendor_name ASC';
  const [rows] = await db.query(sql, params);
  res.json(rows);
});

// Retrieves one vendor by its database ID.
exports.getOne = asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM street_vendors WHERE vendor_id=?', [req.params.id]);
  assert(rows.length > 0, 'Vendor not found', 404);
  res.json(rows[0]);
});

// Validates vendor details and inserts a new street vendor.
exports.create = asyncHandler(async (req, res) => {
  const {
    vendor_name, business_name, telephone, location_maseru,
    registration_date, status = 'Active'
  } = req.body;

  assert(isNonEmptyString(vendor_name), 'Vendor name is required');
  if (telephone) assert(isValidPhone(telephone), 'Invalid telephone');
  assert(['Active', 'Inactive'].includes(status), 'Invalid status');

  const [result] = await db.query(
    `INSERT INTO street_vendors
     (vendor_name, business_name, telephone, location_maseru, registration_date, status)
     VALUES (?,?,?,?,?,?)`,
    [vendor_name.trim(), business_name || null, telephone || null,
     location_maseru || null, registration_date || null, status]
  );
  res.status(201).json({ vendor_id: result.insertId });
});

// Validates and updates an existing street vendor.
exports.update = asyncHandler(async (req, res) => {
  const {
    vendor_name, business_name, telephone, location_maseru,
    registration_date, status = 'Active'
  } = req.body;
  assert(isNonEmptyString(vendor_name), 'Vendor name is required');

  const [result] = await db.query(
    `UPDATE street_vendors SET vendor_name=?, business_name=?, telephone=?,
     location_maseru=?, registration_date=?, status=? WHERE vendor_id=?`,
    [vendor_name, business_name || null, telephone || null,
     location_maseru || null, registration_date || null, status, req.params.id]
  );
  assert(result.affectedRows > 0, 'Vendor not found', 404);
  res.json({ message: 'Vendor updated' });
});

// Deletes a vendor and reports an error when its ID does not exist.
exports.remove = asyncHandler(async (req, res) => {
  const [result] = await db.query('DELETE FROM street_vendors WHERE vendor_id=?', [req.params.id]);
  assert(result.affectedRows > 0, 'Vendor not found', 404);
  res.json({ message: 'Vendor deleted' });
});