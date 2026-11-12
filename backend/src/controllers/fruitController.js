// Provides the shared promise-based MySQL connection pool.
const db = require('../config/db');
// Sends asynchronous failures to the central Express error handler.
const asyncHandler = require('../utils/asyncHandler');
// Validates names and turns failed rules into HTTP errors.
const { isNonEmptyString, assert } = require('../utils/validators');

// Lists fruits, optionally filtering by name and active status.
exports.getAll = asyncHandler(async (req, res) => {
  const { search = '', status } = req.query;
  let sql = 'SELECT * FROM fruits WHERE 1=1';
  const params = [];
  if (search) { sql += ' AND fruit_name LIKE ?'; params.push(`%${search}%`); }
  if (status) { sql += ' AND status=?'; params.push(status); }
  sql += ' ORDER BY fruit_name ASC';
  const [rows] = await db.query(sql, params);
  res.json(rows);
});

// Retrieves one fruit by its database ID.
exports.getOne = asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM fruits WHERE fruit_id=?', [req.params.id]);
  assert(rows.length > 0, 'Fruit not found', 404);
  res.json(rows[0]);
});

// Validates and inserts a new fruit in the catalogue.
exports.create = asyncHandler(async (req, res) => {
  const { fruit_name, status = 'Active' } = req.body;
  assert(isNonEmptyString(fruit_name), 'fruit_name is required');
  assert(['Active', 'Inactive'].includes(status), 'Invalid status');

  const [result] = await db.query(
    'INSERT INTO fruits (fruit_name, status) VALUES (?,?)',
    [fruit_name.trim(), status]
  );
  res.status(201).json({ fruit_id: result.insertId, fruit_name, status });
});

// Validates and updates an existing fruit.
exports.update = asyncHandler(async (req, res) => {
  const { fruit_name, status } = req.body;
  assert(isNonEmptyString(fruit_name), 'fruit_name is required');
  assert(['Active', 'Inactive'].includes(status), 'Invalid status');

  const [result] = await db.query(
    'UPDATE fruits SET fruit_name=?, status=? WHERE fruit_id=?',
    [fruit_name.trim(), status, req.params.id]
  );
  assert(result.affectedRows > 0, 'Fruit not found', 404);
  res.json({ message: 'Fruit updated' });
});

// Deletes a fruit and reports an error when its ID does not exist.
exports.remove = asyncHandler(async (req, res) => {
  const [result] = await db.query('DELETE FROM fruits WHERE fruit_id=?', [req.params.id]);
  assert(result.affectedRows > 0, 'Fruit not found', 404);
  res.json({ message: 'Fruit deleted' });
});