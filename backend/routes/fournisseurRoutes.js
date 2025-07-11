// backend/routes/fournisseurRoutes.js
const express = require('express');
const router = express.Router();
const { createFournisseur, getFournisseurs, updateFournisseur, deleteFournisseur, addSiteToFournisseur, deleteSiteFromFournisseur  } = require('../controllers/fournisseurController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Création, mise à jour et suppression sont réservées aux Managers et Gestionnaires
router.post('/', protect, authorize('Manager', 'Gestionnaire'), createFournisseur);
router.put('/:id', protect, authorize('Manager', 'Gestionnaire'), updateFournisseur);
router.delete('/:id', protect, authorize('Manager', 'Gestionnaire'), deleteFournisseur);

// Tout utilisateur connecté peut voir la liste des fournisseurs
router.get('/', protect, getFournisseurs);

router.post('/:id/sites', protect, authorize('Manager', 'Gestionnaire'), addSiteToFournisseur);
router.delete('/:id/sites/:siteId', protect, authorize('Manager', 'Gestionnaire'), deleteSiteFromFournisseur);

module.exports = router;