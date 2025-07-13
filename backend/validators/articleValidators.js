// backend/validators/articleValidators.js
const { body, param } = require('express-validator');

exports.createArticleValidator = [
    body('codeArticle').not().isEmpty().withMessage('Le code article est requis.'),
    body('designation').not().isEmpty().withMessage('La désignation est requise.'),
];

exports.addFournisseurValidator = [
    param('id').isMongoId().withMessage("ID d'article invalide."),
    body('fournisseurId').isMongoId().withMessage("ID de fournisseur invalide."),
    body('prixUnitaire').isFloat({ gt: 0 }).withMessage('Le prix unitaire doit être un nombre positif.'),
];

exports.updateFournisseurValidator = [
    param('id').isMongoId().withMessage("ID d'article invalide."),
    param('fournisseurInfoId').isMongoId().withMessage("ID de l'information fournisseur invalide."),
    body('prixUnitaire').optional().isFloat({ gt: 0 }).withMessage('Le prix unitaire doit être un nombre positif.'),
    body('referenceFournisseur').optional().isString(),
];
