// backend/routes/stationRoutes.js
const express = require('express');
const router = express.Router();
const { createStation, getStations, updateStation, deleteStation } = require('../controllers/stationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Création, mise à jour et suppression sont réservées aux Managers et Gestionnaires
router.post('/', protect, authorize('Manager', 'Gestionnaire'), createStation);
router.put('/:id', protect, authorize('Manager', 'Gestionnaire'), updateStation);
router.delete('/:id', protect, authorize('Manager', 'Gestionnaire'), deleteStation);

// Tout utilisateur connecté peut voir la liste des stations
router.get('/', protect, getStations);

module.exports = router;