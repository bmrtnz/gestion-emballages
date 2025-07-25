// backend/validators/stockValidators.js
const { body, param } = require('express-validator');

exports.submitStockValidator = [
    body('dateInventaire').isISO8601().withMessage("La date d'inventaire doit être une date valide."),
    body('stocks').isArray({ min: 1 }).withMessage("La liste des stocks ne peut pas être vide."),
    body('stocks.*.articleId').isMongoId().withMessage("Chaque article en stock doit avoir un ID d'article valide."),
    body('stocks.*.quantite').isNumeric().withMessage("La quantité en stock doit être un nombre."),
];

exports.updateArticleStockValidator = [
    param('fournisseurId').isMongoId().withMessage("L'ID du fournisseur doit être valide."),
    param('siteId').isMongoId().withMessage("L'ID du site doit être valide."),
    param('articleId').isMongoId().withMessage("L'ID de l'article doit être valide."),
    body('quantite')
        .isNumeric().withMessage("La quantité doit être un nombre.")
        .isFloat({ min: 0 }).withMessage("La quantité doit être positive.")
];
