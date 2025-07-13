// backend/routes/stockRoutes.js
const express = require("express");
const router = express.Router();
const { submitStock } = require("../controllers/stockController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const { submitStockValidator } = require("../validators/stockValidators");

/**
 * @fileoverview Routes pour la gestion des inventaires de stock.
 * @module routes/stockRoutes
 */

/**
 * @swagger
 * tags:
 *   name: Stocks
 *   description: Gestion des inventaires de stock
 */

router
    .route("/")
    /**
     * @swagger
     * /stocks:
     *   post:
     *     summary: Soumettre un inventaire de stock
     *     tags: [Stocks]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/StockSubmission'
     *     responses:
     *       201:
     *         description: Stock enregistré avec succès.
     */
    .post(
        protect,
        authorize("Station", "Fournisseur"),
        submitStockValidator,
        validate,
        submitStock
    );

module.exports = router;
