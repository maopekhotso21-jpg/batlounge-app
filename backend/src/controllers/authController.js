const bcrypt = require('bcryptjs');
// Signs and verifies JSON Web Tokens used for authentication.
const jwt = require('jsonwebtoken');
// Provides the shared promise-based MySQL connection pool.
const db = require('../config/db');
// Forwards rejected async controller promises to error middleware.
const asyncHandler = require('../utils/asyncHandler');
// Validates required text and creates HTTP-aware validation errors.
const { isNonEmptyString, assert } = require('../utils/validators');
// Loads JWT configuration from environment variables.
require('dotenv').config();

// Creates a signed token containing the user's identity and role.
const signToken = (user) =>
  jwt.sign(
    { user_id: user.user_id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

// Authenticates username/password credentials and returns a signed token.
exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  assert(isNonEmptyString(username) && isNonEmptyString(password),
    'Username and password are required');

  const [rows] = await db.query(
    'SELECT user_id, username, password_hash, role FROM users WHERE username=?',
    [username.trim()]
  );
  assert(rows.length > 0, 'Invalid credentials', 401);

  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  assert(ok, 'Invalid credentials', 401);

  const token = signToken(user);
  res.json({
    token,
    user: { id: user.user_id, username: user.username, role: user.role }
  });
});

// PUBLIC: Creates a user after validating the username, password, and role.
// NOTE: This route is meant for public self-registration. It ALWAYS forces the
// role to "Sales" for security. Admins must be created via the protected
// /register route (admin-only) below.
exports.signup = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  assert(isNonEmptyString(username), 'Username is required');
  assert(isNonEmptyString(password) && password.length >= 6,
    'Password must be at least 6 characters');

  // Check if username already exists
  const [existing] = await db.query('SELECT user_id FROM users WHERE username=?',
    [username.trim()]);
  assert(existing.length === 0, 'Username is already taken', 409);

  // Force the role to "Sales" for safety - a public user can NEVER be an Admin.
  const role = 'Sales';

  const hash = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    'INSERT INTO users (username, password_hash, role) VALUES (?,?,?)',
    [username.trim(), hash, role]
  );
  res.status(201).json({ user_id: result.insertId, username, role });
});

// ADMIN-ONLY: Creates a user (any role) after validating inputs.
// This route is protected by authenticate + authorize('Admin').
exports.register = asyncHandler(async (req, res) => {
  const { username, password, role } = req.body;
  assert(isNonEmptyString(username), 'Username is required');
  assert(isNonEmptyString(password) && password.length >= 6,
    'Password must be at least 6 characters');
  assert(['Admin', 'Sales'].includes(role), 'Role must be Admin or Sales');

  const hash = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    'INSERT INTO users (username, password_hash, role) VALUES (?,?,?)',
    [username.trim(), hash, role]
  );
  res.status(201).json({ user_id: result.insertId, username, role });
});

// Looks up the authenticated user and returns non-sensitive profile data.
exports.me = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    'SELECT user_id, username, role FROM users WHERE user_id=?',
    [req.user.user_id]
  );
  assert(rows.length > 0, 'User not found', 404);
  res.json(rows[0]);
});

// Verifies the old password, hashes the new one, and saves it for the user.
exports.changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  assert(isNonEmptyString(oldPassword), 'Old password is required');
  assert(isNonEmptyString(newPassword) && newPassword.length >= 6,
    'New password must be at least 6 characters');

  const [rows] = await db.query('SELECT password_hash FROM users WHERE user_id=?',
    [req.user.user_id]);
  assert(rows.length > 0, 'User not found', 404);

  const ok = await bcrypt.compare(oldPassword, rows[0].password_hash);
  assert(ok, 'Old password is incorrect', 401);

  const hash = await bcrypt.hash(newPassword, 10);
  await db.query('UPDATE users SET password_hash=? WHERE user_id=?',
    [hash, req.user.user_id]);
  res.json({ message: 'Password updated' });
});