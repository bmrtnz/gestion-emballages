// backend/routes/demandeTransfertRoutes.js
const express = require('express');
const router = express.Router();
const { createDemandeTransfert, updateDemandeTransfertStatut } = require('../controllers/demandeTransfertController');
const { protect, authorize } = require('../middleware/authMiddleware');

// La création est réservée aux stations
router.route('/')
    .post(protect, authorize('Station'), createDemandeTransfert);

// La mise à jour de statut est réservée aux stations et gestionnaires
router.route('/:id/statut')
    .put(protect, authorize('Station', 'Gestionnaire'), updateDemandeTransfertStatut);

module.exports = router;