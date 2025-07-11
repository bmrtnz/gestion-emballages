// backend/routes/listeAchatRoutes.js
const express = require('express');
const router = express.Router();
const { getOrCreateListeAchat, updateItemInListeAchat, validateListeAchat } = require('../controllers/listeAchatController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Toutes ces actions sont réservées aux utilisateurs de type 'Station'
router.use(protect, authorize('Station'));

router.route('/')
    .get(getOrCreateListeAchat)
    .post(updateItemInListeAchat); // Pour ajouter/maj un article

router.route('/validate')
    .post(validateListeAchat);

module.exports = router;