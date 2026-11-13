// Creates the Express application and its HTTP middleware pipeline.
const express = require('express');
// Allows browser clients from other origins to call the API.
const cors = require('cors');
// Loads environment variables before routes or configuration are used.
require('dotenv').config();

// Imports route modules that define each API area.
const authRoutes = require('./routes/authRoutes');
const fruitRoutes = require('./routes/fruitRoutes');
const boxSizeRoutes = require('./routes/boxSizeRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const stockRoutes = require('./routes/stockRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reportRoutes = require('./routes/reportRoutes');
// Imports the final handlers for unknown routes and thrown errors.
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// The app is exported separately so server startup and tests can reuse it.
const app = express();

// Restricts deployed cross-origin requests to the configured frontend URL.
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
  : true;
app.use(cors({ origin: allowedOrigins }));
// Parses JSON request bodies and limits them to one megabyte.
app.use(express.json({ limit: '1mb' }));
// Parses URL-encoded form bodies, including nested values.
app.use(express.urlencoded({ extended: true }));

// Reports whether the API process is responding.
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', service: 'Batloung-backend', time: new Date() })
);

// Mounts each feature's routes under its API prefix.
app.use('/api/auth', authRoutes);
app.use('/api/fruits', fruitRoutes);
app.use('/api/box-sizes', boxSizeRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);

// These handlers must be last so they see requests left by all feature routes.
app.use(notFound);
app.use(errorHandler);

// Exports the configured app; server.js is responsible for listening on a port.
module.exports = app;