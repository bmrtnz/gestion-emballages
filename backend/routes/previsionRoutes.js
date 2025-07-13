// backend/routes/previsionRoutes.js
const express = require("express");
const router = express.Router();
const {
    createPrevision,
    updatePrevision,
} = require("../controllers/previsionController");
const { protect, authorize } = require("../middleware/authMiddleware");

/**
 * @fileoverview Routes pour la gestion des prévisions de commande.
 * @module routes/previsionRoutes
 */

/**
 * @swagger
 * tags:
 *   name: Prévisions
 *   description: Gestion des prévisions de commande
 */

router.use(protect, authorize("Manager", "Gestionnaire"));

router
    .route("/")
    /**
     * @swagger
     * /previsions:
     *   post:
     *     summary: Créer une nouvelle campagne de prévision
     *     tags: [Prévisions]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Prevision'
     *     responses:
     *       201:
     *         description: Prévision créée avec succès.
     */
    .post(createPrevision);

router
    .route("/:id")
    /**
     * @swagger
     * /previsions/{id}:
     *   put:
     *     summary: Mettre à jour les quantités d'une prévision
     *     tags: [Prévisions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de la prévision
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               updates:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     annee:
     *                       type: number
     *                     numeroSemaine:
     *                       type: number
     *                     quantitePrevue:
     *                       type: number
     *     responses:
     *       200:
     *         description: Prévision mise à jour avec succès.
     */
    .put(updatePrevision);

module.exports = router;
