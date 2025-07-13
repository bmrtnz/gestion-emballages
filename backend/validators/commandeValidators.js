// backend/validators/commandeValidators.js
const { body, param } = require('express-validator');

exports.updateStatusCommandeValidator = [
    param('id').isMongoId().withMessage('ID de commande invalide.'),
    body('statut').isIn(['Confirmée', 'Expédiée', 'Réceptionnée', 'Clôturée', 'Facturée', 'Archivée']).withMessage('Statut invalide.'),
    // Validations conditionnelles
    body('articles').if(body('statut').equals('Confirmée')).isArray().withMessage('Les articles sont requis pour confirmer.'),
    body('informationsExpedition.bonLivraisonUrl').if(body('statut').equals('Expédiée')).not().isEmpty().withMessage('Le bon de livraison est requis pour expédier.'),
    body('informationsReception.bonLivraisonEmargeUrl').if(body('statut').equals('Réceptionnée')).not().isEmpty().withMessage('Le bon de livraison émargé est requis pour réceptionner.'),
];
