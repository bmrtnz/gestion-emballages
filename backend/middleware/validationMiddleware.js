// backend/middleware/validationMiddleware.js
const { validationResult } = require('express-validator');
const { BadRequestError } = require('../utils/appError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  // Passe les erreurs au gestionnaire d'erreurs centralisé
  return next(new BadRequestError(JSON.stringify(extractedErrors)));
};

module.exports = {
  validate,
};
