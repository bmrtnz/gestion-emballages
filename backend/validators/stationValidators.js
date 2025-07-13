// backend/validators/stationValidators.js
const { body, param } = require('express-validator');

exports.createStationValidator = [
    body('nom').not().isEmpty().withMessage('Le nom de la station est requis.'),
    body('identifiantInterne').not().isEmpty().withMessage("L'identifiant interne est requis."),
];

exports.updateStationValidator = [
    param('id').isMongoId().withMessage('ID de station invalide.'),
    body('nom').optional().not().isEmpty().withMessage('Le nom de la station ne peut pas être vide.'),
];
