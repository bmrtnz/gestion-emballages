class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Ressource non trouvée') {
    super(message, 404);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Requête invalide') {
    super(message, 400);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Accès refusé. Droits insuffisants.') {
    super(message, 403);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Non autorisé') {
    super(message, 401);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Données de validation invalides') {
    super(message, 400);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
};