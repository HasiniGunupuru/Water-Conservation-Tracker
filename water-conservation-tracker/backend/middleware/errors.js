function notFound(req, res) {
  res.status(404).json({ error: 'Route not found.' });
}
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 500 ? err.status : 500;
  if (process.env.NODE_ENV !== 'production') console.error(`[${status}] ${req.method} ${req.path}:`, err.message);
  res.status(status).json({ error: status === 500 ? 'Something went wrong. Please try again.' : err.message });
}
function badRequest(message) { const error = new Error(message); error.status = 400; return error; }
module.exports = { notFound, errorHandler, badRequest };
