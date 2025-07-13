const { AppError, BadRequestError } = require('../utils/appError');

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';
  error.message = err.message;


  if (process.env.NODE_ENV === 'development') {
    // Detailed error for dev
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      stack: err.stack,
      error: err,
    });
  }

  // Production error handling
  // Handle specific Mongoose errors
  if (err.name === 'CastError') {
    const message = `Ressource invalide pour le chemin ${err.path}: ${err.value}`;
    error = new BadRequestError(message);
  }
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Données invalides: ${errors.join('. ')}`;
    error = new BadRequestError(message);
  }
  if (err.code === 11000) {
    const value = Object.keys(err.keyValue)[0];
    const message = `La valeur du champ '${value}' doit être unique.`;
    error = new BadRequestError(message);
  }
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Token invalide. Veuillez vous reconnecter.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expiré. Veuillez vous reconnecter.', 401);
  }

  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }

  // For non-operational errors, log them and send a generic message
  console.error('ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'Une erreur inattendue est survenue.',
  });
};

module.exports = { notFound, errorHandler };
