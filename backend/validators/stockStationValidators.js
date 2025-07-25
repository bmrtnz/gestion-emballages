/**
 * @fileoverview Validateurs pour les stocks stations
 * @module validators/stockStationValidators
 */

const { body, param } = require('express-validator');

/**
 * Validateur pour soumettre un stock station
 */
exports.submitStationStockValidator = [
    body('dateInventaire')
        .isISO8601()
        .withMessage("La date d'inventaire doit être une date valide."),
    body('stocks')
        .isArray({ min: 1 })
        .withMessage("La liste des stocks ne peut pas être vide."),
    body('stocks.*.articleId')
        .isMongoId()
        .withMessage("Chaque article en stock doit avoir un ID d'article valide."),
    body('stocks.*.quantite')
        .isNumeric()
        .withMessage("La quantité en stock doit être un nombre.")
        .isFloat({ min: 0 })
        .withMessage("La quantité doit être positive."),
    body('stationId')
        .optional()
        .isMongoId()
        .withMessage("L'ID de la station doit être valide (pour les gestionnaires).")
];

/**
 * Validateur pour mettre à jour un article dans le stock station
 */
exports.updateStationArticleStockValidator = [
    param('stationId')
        .isMongoId()
        .withMessage("L'ID de la station doit être valide."),
    param('articleId')
        .isMongoId()
        .withMessage("L'ID de l'article doit être valide."),
    body('quantite')
        .isNumeric()
        .withMessage("La quantité doit être un nombre.")
        .isFloat({ min: 0 })
        .withMessage("La quantité doit être positive."),
    body('dateInventaire')
        .optional()
        .isISO8601()
        .withMessage("La date d'inventaire doit être une date valide.")
];