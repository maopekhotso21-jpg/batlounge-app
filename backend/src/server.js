// Loads environment variables before the port is read.
require('dotenv').config();
// Imports the configured Express application.
const app = require('./app');

// Uses the configured port or 5000 when no PORT value was supplied.
const PORT = process.env.PORT || 5000;
// Starts accepting HTTP requests and keeps the server handle for shutdown handling.
const server = app.listen(PORT, () =>
  console.log(`🚀 Batloung API running on http://localhost:${PORT}`)
);

// Logs rejected promises that were not handled by application code.
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
// Logs unexpected exceptions, then closes the server before exiting.
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});