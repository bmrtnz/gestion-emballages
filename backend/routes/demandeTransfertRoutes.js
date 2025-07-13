// backend/routes/demandeTransfertRoutes.js
const express = require("express");
const router = express.Router();
const {
    createDemandeTransfert,
    updateDemandeTransfertStatut,
} = require("../controllers/demandeTransfertController");
const { protect, authorize } = require("../middleware/authMiddleware");

/**
 * @fileoverview Routes pour la gestion des demandes de transfert entre stations.
 * @module routes/demandeTransfertRoutes
 */

/**
 * @swagger
 * tags:
 *   name: Demandes de Transfert
 *   description: Gestion des transferts de stock entre stations
 */

router
    .route("/")
    /**
     * @swagger
     * /demandes-transfert:
     *   post:
     *     summary: Créer une nouvelle demande de transfert
     *     tags: [Demandes de Transfert]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/DemandeTransfert'
     *     responses:
     *       201:
     *         description: Demande de transfert créée avec succès.
     */
    .post(protect, authorize("Station"), createDemandeTransfert);

router
    .route("/:id/statut")
    /**
     * @swagger
     * /demandes-transfert/{id}/statut:
     *   put:
     *     summary: Mettre à jour le statut d'une demande de transfert
     *     tags: [Demandes de Transfert]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de la demande de transfert
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               statut:
     *                 type: string
     *                 enum: [Confirmée, Rejetée, Traitée logistique, Expédiée, Réceptionnée, Clôturée, Traitée comptabilité, Archivée]
     *     responses:
     *       200:
     *         description: Statut mis à jour avec succès.
     *       400:
     *         description: Transition de statut invalide.
     *       403:
     *         description: Action non autorisée.
     */
    .put(
        protect,
        authorize("Station", "Gestionnaire", "Manager"),
        updateDemandeTransfertStatut
    );

module.exports = router;
