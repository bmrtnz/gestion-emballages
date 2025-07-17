// backend/validators/articleValidators.js
const { body, param } = require('express-validator');
const { ARTICLE_CATEGORIES } = require('../utils/constants');

exports.createArticleValidator = [
    body('codeArticle').not().isEmpty().withMessage('Le code article est requis.'),
    body('designation').not().isEmpty().withMessage('La désignation est requise.'),
    body('categorie').optional().isIn(ARTICLE_CATEGORIES).withMessage('Catégorie invalide.'),
];

exports.updateArticleValidator = [
    param('id').isMongoId().withMessage("ID d'article invalide."),
    body('codeArticle').optional().not().isEmpty().withMessage('Le code article ne peut pas être vide.'),
    body('designation').optional().not().isEmpty().withMessage('La désignation ne peut pas être vide.'),
    body('categorie').optional().isIn(ARTICLE_CATEGORIES).withMessage('Catégorie invalide.'),
    body('isActive').optional().isBoolean().withMessage('Le statut doit être un booléen.'),
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
