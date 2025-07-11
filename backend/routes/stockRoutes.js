// backend/routes/stockRoutes.js
const express = require('express');
const router = express.Router();
const { submitStock } = require('../controllers/stockController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('Station', 'Fournisseur'), submitStock);

module.exports = router;