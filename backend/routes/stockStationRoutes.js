/**
 * @fileoverview Routes pour la gestion des stocks stations
 * @module routes/stockStationRoutes
 */

const express = require('express');
const router = express.Router();
const {
    submitStock,
    getStationStock,
    getArticleStockHistory,
    getAllStationsStockSummary,
    updateArticleStock,
    deleteStockEntry
} = require('../controllers/stockStationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { 
    submitStationStockValidator,
    updateStationArticleStockValidator
} = require('../validators/stockStationValidators');

/**
 * @swagger
 * tags:
 *   name: StocksStations
 *   description: Gestion des stocks stations
 */

// Routes de base pour les stocks stations
router
    .route('/')
    /**
     * @swagger
     * /stocks-stations:
     *   post:
     *     summary: Soumettre un inventaire de stock station
     *     tags: [StocksStations]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               stationId:
     *                 type: string
     *                 description: ID de la station (requis pour les gestionnaires)
     *               dateInventaire:
     *                 type: string
     *                 format: date
     *               stocks:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     articleId:
     *                       type: string
     *                     quantite:
     *                       type: number
     *     responses:
     *       201:
     *         description: Stock enregistré avec succès
     *       400:
     *         description: Données invalides
     *       403:
     *         description: Accès non autorisé
     */
    .post(
        protect,
        authorize('Station', 'Gestionnaire'),
        submitStationStockValidator,
        validate,
        submitStock
    );

// Routes pour obtenir un résumé de tous les stocks (gestionnaires uniquement)
router
    .route('/summary')
    /**
     * @swagger
     * /stocks-stations/summary:
     *   get:
     *     summary: Obtenir un résumé des stocks de toutes les stations
     *     tags: [StocksStations]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Résumé des stocks par station
     *       403:
     *         description: Accès réservé aux gestionnaires
     */
    .get(
        protect,
        authorize('Gestionnaire'),
        getAllStationsStockSummary
    );

// Routes pour une station spécifique
router
    .route('/stations/:stationId')
    /**
     * @swagger
     * /stocks-stations/stations/{stationId}:
     *   get:
     *     summary: Obtenir le stock actuel d'une station
     *     tags: [StocksStations]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: stationId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID de la station
     *     responses:
     *       200:
     *         description: Stock actuel de la station
     *       403:
     *         description: Accès non autorisé
     */
    .get(
        protect,
        authorize('Station', 'Gestionnaire'),
        getStationStock
    );

// Routes pour l'historique d'un article
router
    .route('/stations/:stationId/articles/:articleId/history')
    /**
     * @swagger
     * /stocks-stations/stations/{stationId}/articles/{articleId}/history:
     *   get:
     *     summary: Obtenir l'historique du stock d'un article
     *     tags: [StocksStations]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: stationId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID de la station
     *       - in: path
     *         name: articleId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID de l'article
     *     responses:
     *       200:
     *         description: Historique des mouvements de stock
     *       403:
     *         description: Accès non autorisé
     */
    .get(
        protect,
        authorize('Station', 'Gestionnaire'),
        getArticleStockHistory
    );

// Routes pour mettre à jour le stock d'un article
router
    .route('/stations/:stationId/articles/:articleId')
    /**
     * @swagger
     * /stocks-stations/stations/{stationId}/articles/{articleId}:
     *   put:
     *     summary: Mettre à jour le stock d'un article
     *     tags: [StocksStations]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: stationId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID de la station
     *       - in: path
     *         name: articleId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID de l'article
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               quantite:
     *                 type: number
     *                 minimum: 0
     *                 description: Nouvelle quantité en stock
     *               dateInventaire:
     *                 type: string
     *                 format: date
     *                 description: Date de l'inventaire (optionnel)
     *             required:
     *               - quantite
     *     responses:
     *       200:
     *         description: Stock mis à jour avec succès
     *       400:
     *         description: Données invalides
     *       403:
     *         description: Accès non autorisé
     */
    .put(
        protect,
        authorize('Station', 'Gestionnaire'),
        updateStationArticleStockValidator,
        validate,
        updateArticleStock
    );

// Routes pour supprimer une entrée de stock
router
    .route('/:stockId')
    /**
     * @swagger
     * /stocks-stations/{stockId}:
     *   delete:
     *     summary: Supprimer une entrée de stock (correction d'erreur)
     *     tags: [StocksStations]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: stockId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID de l'entrée de stock
     *     responses:
     *       200:
     *         description: Entrée supprimée avec succès
     *       403:
     *         description: Accès non autorisé
     *       404:
     *         description: Entrée non trouvée
     */
    .delete(
        protect,
        authorize('Station', 'Gestionnaire'),
        deleteStockEntry
    );

module.exports = router;