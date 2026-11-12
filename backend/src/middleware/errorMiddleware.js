// Handles requests that did not match any registered route.
exports.notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Converts controller and database errors into consistent JSON responses.
exports.errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err.message);

  // MySQL duplicate entry means the requested record conflicts with existing data.
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'Duplicate record', detail: err.sqlMessage });
  }
  // MySQL foreign-key errors usually mean a record is still being used or missing.
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ message: 'Record is referenced and cannot be deleted' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ message: 'Referenced record does not exist' });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};