// backend/routes/commandeRoutes.js
const express = require('express');
const router = express.Router();
const { getCommandeById, updateCommandeStatut } = require('../controllers/commandeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// La consultation et la mise à jour de statut sont réservées aux utilisateurs connectés ayant le bon rôle.
// La logique fine de qui peut faire quoi est dans le contrôleur.
router.route('/:id')
    .get(protect, getCommandeById);

router.route('/:id/statut')
    .put(protect, authorize('Fournisseur', 'Station', 'Gestionnaire'), updateCommandeStatut);

module.exports = router;