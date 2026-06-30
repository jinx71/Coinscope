// Central error handler. Always returns the standard { success, message, errors } envelope.
const errorHandler = (err, req, res, next) => {
  let status = err.status || res.statusCode;
  if (!status || status < 400) status = 500;

  let message = err.message || 'Server error';
  const errors = err.errors || [];

  // Mongoose validation
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    for (const k of Object.keys(err.errors || {})) {
      errors.push({ field: k, message: err.errors[k].message });
    }
  }

  // Mongo duplicate key
  if (err.code === 11000) {
    status = 409;
    message = 'Duplicate value';
    for (const k of Object.keys(err.keyValue || {})) {
      errors.push({ field: k, message: `${k} already exists` });
    }
  }

  // Mongo bad ObjectId
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}`;
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[error] ${status} ${req.method} ${req.originalUrl} — ${message}`);
    if (status === 500) console.error(err.stack);
  }

  res.status(status).json({ success: false, message, errors });
};

module.exports = errorHandler;
