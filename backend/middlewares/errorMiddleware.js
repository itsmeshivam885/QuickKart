export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Supabase / PostgreSQL unique constraint violation (code 23505)
  if (err.code === '23505') {
    statusCode = 400;
    message = err.details || 'Duplicate entry already exists.';
  }

  // Handle Supabase / PostgreSQL foreign key violation (code 23503)
  if (err.code === '23503') {
    statusCode = 400;
    message = err.details || 'Referenced parent record does not exist.';
  }

  // Handle Supabase / PostgreSQL check constraint violation (code 23514)
  if (err.code === '23514') {
    statusCode = 400;
    message = err.details || 'Value failed table check constraint validation.';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Not authorized, invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Not authorized, token expired';
  }

  console.error(`[Error Handler] ${req.method} ${req.originalUrl} - ${statusCode}: ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
