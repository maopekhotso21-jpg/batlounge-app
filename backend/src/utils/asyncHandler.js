// Wraps an async route handler so rejected promises reach Express error middleware.
// The wrapper receives the usual Express request, response, and next arguments.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Makes the wrapper available to controllers throughout the backend.
module.exports = asyncHandler;