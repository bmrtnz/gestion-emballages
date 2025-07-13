// backend/routes/commandeGlobaleRoutes.js
const express = require('express');
const router = express.Router();
const { getCommandesGlobales, deleteCommandeGlobale } = require('../controllers/commandeGlobaleController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @fileoverview Routes pour la gestion des commandes globales.
 * @module routes/commandeGlobaleRoutes
 */

/**
 * @swagger
 * tags:
 *   name: Commandes Globales
 *   description: Visualisation et gestion des commandes globales
 */

const viewRoles = [protect, authorize('Manager', 'Gestionnaire', 'Station')];
const editRoles = [protect, authorize('Manager', 'Gestionnaire')];

router.route('/')
  /**
   * @swagger
   * /commandes-globales:
   *   get:
   *     summary: Récupérer la liste des commandes globales
   *     tags: [Commandes Globales]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Une liste de commandes globales.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/CommandeGlobale'
   */
  .get(viewRoles, getCommandesGlobales);

router.route('/:id')
  /**
   * @swagger
   * /commandes-globales/{id}:
   *   delete:
   *     summary: Supprimer une commande globale et toutes ses données associées
   *     tags: [Commandes Globales]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID de la commande globale
   *     responses:
   *       200:
   *         description: Commande globale supprimée avec succès.
   *       404:
   *         description: Commande globale non trouvée.
   */
  .delete(editRoles, deleteCommandeGlobale);

module.exports = router;
