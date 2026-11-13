// Provides the shared promise-based MySQL connection pool.
const db = require('../config/db');
// Sends asynchronous failures to the central Express error handler.
const asyncHandler = require('../utils/asyncHandler');
// Validates permitted box sizes and creates HTTP-aware errors.
const { isValidBoxSize, isNonEmptyString, assert } = require('../utils/validators');

// Lists all box sizes in their database order.
exports.getAll = asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM box_sizes ORDER BY box_size_id');
  res.json(rows);
});

// Retrieves one box size by its database ID.
exports.getOne = asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM box_sizes WHERE box_size_id=?', [req.params.id]);
  assert(rows.length > 0, 'Box size not found', 404);
  res.json(rows[0]);
});

// Validates and inserts a new box size and optional description.
exports.create = asyncHandler(async (req, res) => {
  const { size_name, description } = req.body;
  assert(isValidBoxSize(size_name), 'Invalid box size (Small, Medium, Large)');
  const [result] = await db.query(
    'INSERT INTO box_sizes (size_name, description) VALUES (?,?)',
    [size_name, description || null]
  );
  res.status(201).json({ box_size_id: result.insertId, size_name, description });
});

// Validates and updates an existing box size and description.
exports.update = asyncHandler(async (req, res) => {
  const { size_name, description } = req.body;
  assert(isValidBoxSize(size_name), 'Invalid box size');
  const [result] = await db.query(
    'UPDATE box_sizes SET size_name=?, description=? WHERE box_size_id=?',
    [size_name, description || null, req.params.id]
  );
  assert(result.affectedRows > 0, 'Box size not found', 404);
  res.json({ message: 'Box size updated' });
});

// Deletes a box size and reports an error when its ID does not exist.
exports.remove = asyncHandler(async (req, res) => {
  const [result] = await db.query('DELETE FROM box_sizes WHERE box_size_id=?', [req.params.id]);
  assert(result.affectedRows > 0, 'Box size not found', 404);
  res.json({ message: 'Box size deleted' });
});
