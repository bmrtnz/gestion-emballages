/**
 * @fileoverview Validateurs pour les stocks fournisseurs
 * @module validators/stockFournisseurValidators
 */

const { body, param } = require('express-validator');

/**
 * Validateur pour soumettre un stock fournisseur
 */
exports.submitFournisseurStockValidator = [
    body('campagne')
        .matches(/^\d{2}-\d{2}$/)
        .withMessage("Le format de campagne doit être 'XX-YY' (ex: '25-26')."),
    body('siteId')
        .isMongoId()
        .withMessage("L'ID du site doit être valide."),
    body('stocks')
        .isArray()
        .withMessage("La liste des stocks doit être un tableau."),
    body('stocks.*.articleId')
        .optional()
        .isMongoId()
        .withMessage("Chaque article en stock doit avoir un ID d'article valide."),
    body('stocks.*.quantite')
        .optional()
        .isNumeric()
        .withMessage("La quantité en stock doit être un nombre.")
        .isFloat({ min: 0 })
        .withMessage("La quantité doit être positive."),
    body('fournisseurId')
        .optional()
        .isMongoId()
        .withMessage("L'ID du fournisseur doit être valide (pour les gestionnaires).")
];

/**
 * Validateur pour mettre à jour un article dans le stock fournisseur
 */
exports.updateFournisseurArticleStockValidator = [
    param('fournisseurId')
        .isMongoId()
        .withMessage("L'ID du fournisseur doit être valide."),
    param('siteId')
        .isMongoId()
        .withMessage("L'ID du site doit être valide."),
    param('articleId')
        .isMongoId()
        .withMessage("L'ID de l'article doit être valide."),
    body('quantite')
        .isNumeric()
        .withMessage("La quantité doit être un nombre.")
        .isFloat({ min: 0 })
        .withMessage("La quantité doit être positive.")
];

/**
 * Validateur pour mettre à jour le stock hebdomadaire
 */
exports.updateWeeklyStockValidator = [
    param('fournisseurId')
        .isMongoId()
        .withMessage("L'ID du fournisseur doit être valide."),
    param('siteId')
        .isMongoId()
        .withMessage("L'ID du site doit être valide."),
    param('articleId')
        .isMongoId()
        .withMessage("L'ID de l'article doit être valide."),
    body('campagne')
        .matches(/^\d{2}-\d{2}$/)
        .withMessage("Le format de campagne doit être 'XX-YY' (ex: '25-26')."),
    body('numeroSemaine')
        .isInt({ min: 1, max: 52 })
        .withMessage("Le numéro de semaine doit être entre 1 et 52."),
    body('quantite')
        .isNumeric()
        .withMessage("La quantité doit être un nombre.")
        .isFloat({ min: 0 })
        .withMessage("La quantité doit être positive.")
];

/**
 * Validateur pour les paramètres de campagne
 */
exports.campaignParamValidator = [
    param('fournisseurId')
        .isMongoId()
        .withMessage("L'ID du fournisseur doit être valide."),
    param('siteId')
        .isMongoId()
        .withMessage("L'ID du site doit être valide."),
    param('campagne')
        .matches(/^\d{2}-\d{2}$/)
        .withMessage("Le format de campagne doit être 'XX-YY' (ex: '25-26').")
];

/**
 * Validateur pour mettre à jour le stock complet d'une semaine
 */
exports.updateCompleteWeeklyStockValidator = [
    param('fournisseurId')
        .isMongoId()
        .withMessage("L'ID du fournisseur doit être valide."),
    param('siteId')
        .isMongoId()
        .withMessage("L'ID du site doit être valide."),
    body('campagne')
        .matches(/^\d{2}-\d{2}$/)
        .withMessage("Le format de campagne doit être 'XX-YY' (ex: '25-26')."),
    body('numeroSemaine')
        .isInt({ min: 1, max: 52 })
        .withMessage("Le numéro de semaine doit être entre 1 et 52."),
    body('articles')
        .isArray()
        .withMessage("La liste des articles doit être un tableau."),
    body('articles.*.articleId')
        .isMongoId()
        .withMessage("Chaque article doit avoir un ID d'article valide."),
    body('articles.*.quantiteStock')
        .isNumeric()
        .withMessage("La quantité doit être un nombre.")
        .isFloat({ min: 0 })
        .withMessage("La quantité doit être positive.")
];