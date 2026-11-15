import { errorResponse } from '../utils/response.js';

export function errorHandler(err, req, res, next) {
  // Safe logging without leaking sensitive tokens or internal queries
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const message = err.isOperational ? err.message : (statusCode === 500 ? 'Internal server error occurred' : err.message);

  return errorResponse(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : null);
}
