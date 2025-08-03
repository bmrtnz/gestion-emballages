/**
 * @fileoverview Validateurs pour les stocks stations (système hebdomadaire)
 * @module validators/stockStationValidators
 */

const { body, param, query } = require('express-validator');

/**
 * Validateur pour la mise à jour complète des stocks hebdomadaires
 */
exports.validateUpdateWeeklyStock = [
    param('stationId')
        .isMongoId()
        .withMessage("L'ID de la station doit être valide."),
    body('campagne')
        .matches(/^\d{2}-\d{2}$/)
        .withMessage("La campagne doit être au format 'XX-XX' (ex: '25-26')."),
    body('numeroSemaine')
        .isInt({ min: 1, max: 52 })
        .withMessage("Le numéro de semaine doit être entre 1 et 52."),
    body('articles')
        .isArray()
        .withMessage("Les articles doivent être fournis sous forme de tableau."),
    body('articles.*.articleId')
        .isMongoId()
        .withMessage("Chaque article doit avoir un ID valide."),
    body('articles.*.quantiteStock')
        .isFloat({ min: 0 })
        .withMessage("La quantité en stock doit être un nombre positif ou zéro.")
];

/**
 * Validateur pour obtenir le stock d'une semaine spécifique
 */
exports.validateGetWeeklyStock = [
    param('stationId')
        .isMongoId()
        .withMessage("L'ID de la station doit être valide."),
    param('numeroSemaine')
        .isInt({ min: 1, max: 52 })
        .withMessage("Le numéro de semaine doit être entre 1 et 52."),
    query('campagne')
        .matches(/^\d{2}-\d{2}$/)
        .withMessage("La campagne doit être au format 'XX-XX' (ex: '25-26').")
];

/**
 * Validateur pour l'ID de station
 */
exports.validateStationId = [
    param('stationId')
        .isMongoId()
        .withMessage("L'ID de la station doit être valide.")
];

/**
 * Validateur pour la campagne
 */
exports.validateCampaign = [
    param('stationId')
        .isMongoId()
        .withMessage("L'ID de la station doit être valide."),
    param('campagne')
        .matches(/^\d{2}-\d{2}$/)
        .withMessage("La campagne doit être au format 'XX-XX' (ex: '25-26').")
];

/**
 * Validateur pour l'historique d'un article
 */
exports.validateArticleHistory = [
    param('stationId')
        .isMongoId()
        .withMessage("L'ID de la station doit être valide."),
    param('articleId')
        .isMongoId()
        .withMessage("L'ID de l'article doit être valide."),
    param('campagne')
        .matches(/^\d{2}-\d{2}$/)
        .withMessage("La campagne doit être au format 'XX-XX' (ex: '25-26').")
];

// Legacy validators (kept for backward compatibility)
/**
 * Validateur pour soumettre un stock station (ancien système)
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
 * Validateur pour mettre à jour un article dans le stock station (ancien système)
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