// backend/validators/userValidators.js
const { body } = require('express-validator');

exports.createUserValidator = [
    body('email')
        .isEmail().withMessage('Veuillez fournir un email valide.')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères.'),
    body('nomComplet')
        .not().isEmpty().withMessage('Le nom complet est requis.'),
    body('role')
        .isIn(['Manager', 'Gestionnaire', 'Station', 'Fournisseur']).withMessage('Le rôle spécifié est invalide.'),
    body('entiteId')
        .if(body('role').isIn(['Station', 'Fournisseur']))
        .isMongoId().withMessage("L'ID de l'entité doit être un ID MongoDB valide."),
];

exports.loginUserValidator = [
    body('email')
        .isEmail().withMessage('Veuillez fournir un email valide.')
        .normalizeEmail(),
    body('password')
        .not().isEmpty().withMessage('Le mot de passe est requis.'),
];
