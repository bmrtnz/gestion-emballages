// backend/routes/commandeRoutes.js
const express = require("express");
const router = express.Router();
const {
  getCommandeById,
  updateCommandeStatut,
  getCommandes,
  deleteCommande,
} = require("../controllers/commandeController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validate } = require('../middleware/validationMiddleware');
const { updateStatusCommandeValidator } = require('../validators/commandeValidators');

/**
 * @fileoverview Routes pour la gestion des commandes fournisseurs.
 * @module routes/commandeRoutes
 */

/**
 * @swagger
 * tags:
 *   name: Commandes
 *   description: Gestion des commandes fournisseurs
 */

router.route("/")
  /**
   * @swagger
   * /commandes:
   *   get:
   *     summary: Récupérer la liste des commandes
   *     tags: [Commandes]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Une liste de commandes.
   */
  .get(protect, getCommandes);

router.route("/:id")
  /**
   * @swagger
   * /commandes/{id}:
   *   get:
   *     summary: Récupérer les détails d'une commande par son ID
   *     tags: [Commandes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID de la commande
   *     responses:
   *       200:
   *         description: Détails de la commande.
   *       404:
   *         description: Commande non trouvée.
   */
  .get(protect, getCommandeById)
  /**
   * @swagger
   * /commandes/{id}:
   *   delete:
   *     summary: Annuler une commande (pour les stations)
   *     tags: [Commandes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID de la commande
   *     responses:
   *       200:
   *         description: Commande annulée avec succès.
   *       400:
   *         description: La commande ne peut pas être annulée.
   *       403:
   *         description: Action non autorisée.
   */
  .delete(protect, authorize('Station'), deleteCommande);

router
  .route("/:id/statut")
  /**
   * @swagger
   * /commandes/{id}/statut:
   *   put:
   *     summary: Mettre à jour le statut d'une commande
   *     tags: [Commandes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID de la commande
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               statut:
   *                 type: string
   *                 enum: [Confirmée, Expédiée, Réceptionnée, Clôturée, Facturée, Archivée]
   *     responses:
   *       200:
   *         description: Statut mis à jour avec succès.
   *       400:
   *         description: Transition de statut invalide.
   */
  .put(
    protect,
    authorize("Fournisseur", "Station", "Gestionnaire"),
    updateStatusCommandeValidator,
    validate,
    updateCommandeStatut
  );

module.exports = router;

