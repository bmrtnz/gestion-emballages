/**
 * @fileoverview Routes pour la gestion des stocks des stations
 * @module routes/stockStationRoutes
 * @requires express
 * @requires controllers/stockStationController
 * @requires middleware/authMiddleware
 * @requires middleware/validationMiddleware
 * @requires validators/stockStationValidators
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const {
    updateCompleteWeeklyStock,
    getWeeklyStock,
    getStationStockStatus,
    getAllStationStocks,
    getArticleCampaignHistory,
    getCampaignStockStats,
    getStationStocksByCampaign,
    getStationStockSummary,
    getStationsWithArticle
} = require('../controllers/stockStationController');
const {
    validateUpdateWeeklyStock,
    validateGetWeeklyStock,
    validateStationId,
    validateCampaign,
    validateArticleHistory
} = require('../validators/stockStationValidators');

/**
 * @swagger
 * tags:
 *   name: StocksStations
 *   description: Gestion des stocks des stations avec système hebdomadaire
 */

/**
 * @swagger
 * /api/stocks-stations/stations/{stationId}/weekly:
 *   put:
 *     summary: Mettre à jour le stock complet d'une semaine
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campagne:
 *                 type: string
 *                 pattern: '^\\d{2}-\\d{2}$'
 *                 example: "25-26"
 *               numeroSemaine:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 52
 *               articles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     articleId:
 *                       type: string
 *                     quantiteStock:
 *                       type: number
 *                       minimum: 0
 *             required:
 *               - campagne
 *               - numeroSemaine
 *               - articles
 *     responses:
 *       200:
 *         description: Stock hebdomadaire mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès non autorisé
 */
router.put(
    '/stations/:stationId/weekly',
    protect,
    authorize('Station', 'Gestionnaire', 'Manager'),
    validateUpdateWeeklyStock,
    validate,
    updateCompleteWeeklyStock
);

/**
 * @swagger
 * /api/stocks-stations/stations/{stationId}/weeks/{numeroSemaine}:
 *   get:
 *     summary: Obtenir le stock d'une semaine spécifique
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
 *         name: numeroSemaine
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 52
 *         description: Numéro de la semaine
 *       - in: query
 *         name: campagne
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\\d{2}-\\d{2}$'
 *         example: "25-26"
 *         description: Campagne
 *     responses:
 *       200:
 *         description: Stock de la semaine
 *       400:
 *         description: Paramètres manquants ou invalides
 *       403:
 *         description: Accès non autorisé
 */
router.get(
    '/stations/:stationId/weeks/:numeroSemaine',
    protect,
    authorize('Station', 'Gestionnaire', 'Manager'),
    validateGetWeeklyStock,
    validate,
    getWeeklyStock
);

/**
 * @swagger
 * /api/stocks-stations/stations/{stationId}/campaign/{campagne}:
 *   get:
 *     summary: Obtenir tous les stocks d'une station pour une campagne
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
 *         name: campagne
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\\d{2}-\\d{2}$'
 *         example: "25-26"
 *         description: Campagne
 *     responses:
 *       200:
 *         description: Stocks de la campagne
 *       403:
 *         description: Accès non autorisé
 */
router.get(
    '/stations/:stationId/campaign/:campagne',
    protect,
    authorize('Station', 'Gestionnaire', 'Manager'),
    getStationStocksByCampaign
);

/**
 * @swagger
 * /api/stocks-stations/status/{stationId}:
 *   get:
 *     summary: Obtenir le statut de mise à jour des stocks d'une station
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
 *         description: Statut des stocks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     lastUpdateDate:
 *                       type: string
 *                       format: date-time
 *                     daysSinceUpdate:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [never, good, warning, critical]
 *       403:
 *         description: Accès non autorisé
 */
router.get(
    '/status/:stationId',
    protect,
    authorize('Station', 'Gestionnaire', 'Manager'),
    validateStationId,
    validate,
    getStationStockStatus
);

/**
 * @swagger
 * /api/stocks-stations/stations/{stationId}:
 *   get:
 *     summary: Obtenir tous les stocks d'une station
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
 *         description: Tous les stocks de la station
 *       403:
 *         description: Accès non autorisé
 */
router.get(
    '/stations/:stationId',
    protect,
    authorize('Station', 'Gestionnaire', 'Manager'),
    validateStationId,
    validate,
    getAllStationStocks
);

/**
 * @swagger
 * /api/stocks-stations/stations/{stationId}/articles/{articleId}/campaigns/{campagne}/history:
 *   get:
 *     summary: Obtenir l'historique de stock d'un article pour une campagne
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
 *       - in: path
 *         name: campagne
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\\d{2}-\\d{2}$'
 *         example: "25-26"
 *         description: Campagne
 *     responses:
 *       200:
 *         description: Historique de l'article
 *       403:
 *         description: Accès non autorisé
 */
router.get(
    '/stations/:stationId/articles/:articleId/campaigns/:campagne/history',
    protect,
    authorize('Station', 'Gestionnaire', 'Manager'),
    validateArticleHistory,
    validate,
    getArticleCampaignHistory
);

/**
 * @swagger
 * /api/stocks-stations/stations/{stationId}/campaigns/{campagne}/stats:
 *   get:
 *     summary: Obtenir les statistiques de stock pour une campagne
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
 *         name: campagne
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\\d{2}-\\d{2}$'
 *         example: "25-26"
 *         description: Campagne
 *     responses:
 *       200:
 *         description: Statistiques de stock pour la campagne
 *       403:
 *         description: Accès non autorisé
 */
router.get(
    '/stations/:stationId/campaigns/:campagne/stats',
    protect,
    authorize('Station', 'Gestionnaire', 'Manager'),
    validateCampaign,
    validate,
    getCampaignStockStats
);

/**
 * @swagger
 * /api/stocks-stations/stations/{stationId}/campaign/{campagne}/summary:
 *   get:
 *     summary: Obtenir tous les articles avec leur dernière quantité mise à jour
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
 *         name: campagne
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\\d{2}-\\d{2}$'
 *         example: "25-26"
 *         description: Campagne
 *     responses:
 *       200:
 *         description: Résumé des stocks avec dernières quantités
 *       403:
 *         description: Accès non autorisé
 */
router.get(
    '/stations/:stationId/campaign/:campagne/summary',
    protect,
    authorize('Gestionnaire', 'Manager'),
    getStationStockSummary
);

/**
 * @swagger
 * /api/stocks-stations/stations-with-article:
 *   get:
 *     summary: Obtenir les stations ayant un article en stock
 *     tags: [StocksStations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campagne
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\\d{2}-\\d{2}$'
 *         example: "25-26"
 *         description: Campagne
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom ou code de l'article à rechercher
 *     responses:
 *       200:
 *         description: Liste des stations avec l'article en stock
 *       403:
 *         description: Accès non autorisé
 */
router.get(
    '/stations-with-article',
    protect,
    authorize('Gestionnaire', 'Manager'),
    getStationsWithArticle
);

module.exports = router;