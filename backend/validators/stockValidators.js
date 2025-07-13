// backend/validators/stockValidators.js
const { body } = require('express-validator');

exports.submitStockValidator = [
    body('dateInventaire').isISO8601().withMessage("La date d'inventaire doit être une date valide."),
    body('stocks').isArray({ min: 1 }).withMessage("La liste des stocks ne peut pas être vide."),
    body('stocks.*.articleId').isMongoId().withMessage("Chaque article en stock doit avoir un ID d'article valide."),
    body('stocks.*.quantite').isNumeric().withMessage("La quantité en stock doit être un nombre."),
];
