// backend/validators/fournisseurValidators.js
const { body, param } = require('express-validator');

exports.createFournisseurValidator = [
    body('nom').not().isEmpty().withMessage('Le nom du fournisseur est requis.'),
];

exports.addSiteValidator = [
    param('id').isMongoId().withMessage('ID de fournisseur invalide.'),
    body('nomSite').not().isEmpty().withMessage('Le nom du site est requis.'),
];
