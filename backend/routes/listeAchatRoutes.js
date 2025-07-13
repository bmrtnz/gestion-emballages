// backend/routes/listeAchatRoutes.js
const express = require('express');
const router = express.Router();
const { getOrCreateListeAchat, updateItemInListeAchat, validateListeAchat, removeItemFromListeAchat } = require('../controllers/listeAchatController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @fileoverview Routes pour la gestion des listes d'achat des stations.
 * @module routes/listeAchatRoutes
 */

/**
 * @swagger
 * tags:
 *   name: Listes d'Achat
 *   description: Gestion des listes d'achat pour les stations
 */

router.use(protect, authorize('Station'));

router.route('/')
    /**
     * @swagger
     * /listes-achat:
     *   get:
     *     summary: Obtenir la liste d'achat brouillon de la station
     *     tags: [Listes d'Achat]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: La liste d'achat de la station.
     */
    .get(getOrCreateListeAchat)
    /**
     * @swagger
     * /listes-achat:
     *   post:
     *     summary: Ajouter un article à la liste d'achat
     *     tags: [Listes d'Achat]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ListeAchatItem'
     *     responses:
     *       200:
     *         description: Liste d'achat mise à jour.
     */
    .post(updateItemInListeAchat);

router.route('/validate')
    /**
     * @swagger
     * /listes-achat/validate:
     *   post:
     *     summary: Valider la liste d'achat et créer les commandes
     *     tags: [Listes d'Achat]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       201:
     *         description: Commandes créées avec succès.
     */
    .post(validateListeAchat);

router.route('/items/:itemId')
    /**
     * @swagger
     * /listes-achat/items/{itemId}:
     *   delete:
     *     summary: Supprimer un article de la liste d'achat
     *     tags: [Listes d'Achat]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: itemId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de l'article dans la liste
     *     responses:
     *       200:
     *         description: Article supprimé avec succès.
     */
    .delete(removeItemFromListeAchat);

module.exports = router;
