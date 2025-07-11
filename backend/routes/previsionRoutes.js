// backend/routes/previsionRoutes.js
const express = require('express');
const router = express.Router();
const { createPrevision, updatePrevision } = require('../controllers/previsionController');
const { protect, authorize } = require('../middleware/authMiddleware');

// La gestion des prévisions est réservée aux Managers et Gestionnaires
router.use(protect, authorize('Manager', 'Gestionnaire'));

router.route('/')
    .post(createPrevision);

router.route('/:id')
    .put(updatePrevision);

module.exports = router;