const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Default error
  let error = {
    success: false,
    message: err.message || 'Internal Server Error',
    statusCode: err.statusCode || 500
  };

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    error.message = 'Validation error';
    error.errors = err.errors.map(e => e.message);
    error.statusCode = 400;
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    error.message = 'Resource already exists';
    error.statusCode = 409;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.message = 'Validation error';
    error.errors = Object.values(err.errors).map(e => e.message);
    error.statusCode = 400;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error.message = 'Resource already exists';
    error.statusCode = 409;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.statusCode = 401;
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors || null
  });
};

module.exports = errorHandler;
