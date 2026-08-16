export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  console.error(err);

  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) {
    return res.status(500).json({ error: 'Internal server error' });
  }

  res.status(statusCode).json({ error: err.message });
}
