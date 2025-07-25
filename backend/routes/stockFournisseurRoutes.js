/**
 * @fileoverview Routes pour la gestion des stocks fournisseurs
 * @module routes/stockFournisseurRoutes
 */

const express = require('express');
const router = express.Router();
const {
    submitStock,
    getSiteStock,
    getAllSiteStocks,
    updateArticleStock,
    deleteArticleFromStock,
    updateWeeklyStock,
    updateCompleteWeeklyStock,
    getWeeklyStock,
    getArticleCampaignHistory,
    getCampaignStockStats,
    getSupplierStockStatus
} = require('../controllers/stockFournisseurController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { 
    submitFournisseurStockValidator,
    updateFournisseurArticleStockValidator,
    updateWeeklyStockValidator,
    updateCompleteWeeklyStockValidator,
    campaignParamValidator
} = require('../validators/stockFournisseurValidators');

/**
 * @swagger
 * tags:
 *   name: StocksFournisseurs
 *   description: Gestion des stocks fournisseurs par site
 */

// Routes de base pour les stocks fournisseurs
router
    .route('/')
    /**
     * @swagger
     * /stocks-fournisseurs:
     *   post:
     *     summary: Soumettre un inventaire de stock fournisseur
     *     tags: [StocksFournisseurs]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               fournisseurId:
     *                 type: string
     *                 description: ID du fournisseur (requis pour les gestionnaires)
     *               siteId:
     *                 type: string
     *                 description: ID du site
     *               campagne:
     *                 type: string
     *                 pattern: ^\d{2}-\d{2}$
     *                 description: Campagne (format "25-26")
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
        authorize('Fournisseur', 'Gestionnaire'),
        submitFournisseurStockValidator,
        validate,
        submitStock
    );

// Routes pour un fournisseur spécifique
router
    .route('/fournisseurs/:fournisseurId')
    /**
     * @swagger
     * /stocks-fournisseurs/fournisseurs/{fournisseurId}:
     *   get:
     *     summary: Obtenir tous les stocks d'un fournisseur (tous sites)
     *     tags: [StocksFournisseurs]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: fournisseurId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID du fournisseur
     *     responses:
     *       200:
     *         description: Liste des stocks par site
     *       403:
     *         description: Accès non autorisé
     */
    .get(
        protect,
        authorize('Gestionnaire', 'Fournisseur', 'Station'),
        getAllSiteStocks
    );

// Route pour obtenir le statut de mise à jour des stocks d'un fournisseur
router
    .route('/status/:fournisseurId')
    /**
     * @swagger
     * /stocks-fournisseurs/status/{fournisseurId}:
     *   get:
     *     summary: Obtenir le statut de mise à jour des stocks d'un fournisseur
     *     tags: [StocksFournisseurs]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: fournisseurId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID du fournisseur
     *     responses:
     *       200:
     *         description: Statut de mise à jour des stocks
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 lastUpdateDate:
     *                   type: string
     *                   format: date-time
     *                   description: Date de la dernière mise à jour
     *                 daysSinceUpdate:
     *                   type: number
     *                   description: Nombre de jours depuis la dernière mise à jour
     *                 status:
     *                   type: string
     *                   enum: [good, warning, critical, never]
     *                   description: Statut basé sur l'ancienneté de la mise à jour
     *       403:
     *         description: Accès non autorisé
     */
    .get(
        protect,
        authorize('Gestionnaire', 'Fournisseur'),
        getSupplierStockStatus
    );

// Routes pour un site spécifique
router
    .route('/fournisseurs/:fournisseurId/sites/:siteId')
    /**
     * @swagger
     * /stocks-fournisseurs/fournisseurs/{fournisseurId}/sites/{siteId}:
     *   get:
     *     summary: Obtenir le stock d'un site spécifique
     *     tags: [StocksFournisseurs]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: fournisseurId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID du fournisseur
     *       - in: path
     *         name: siteId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID du site
     *     responses:
     *       200:
     *         description: Stock du site avec détails des articles
     *       403:
     *         description: Accès non autorisé
     */
    .get(
        protect,
        authorize('Gestionnaire', 'Fournisseur', 'Station'),
        getSiteStock
    );

// Routes pour un article spécifique
router
    .route('/fournisseurs/:fournisseurId/sites/:siteId/articles/:articleId')
    /**
     * @swagger
     * /stocks-fournisseurs/fournisseurs/{fournisseurId}/sites/{siteId}/articles/{articleId}:
     *   put:
     *     summary: Mettre à jour le stock d'un article
     *     tags: [StocksFournisseurs]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: fournisseurId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID du fournisseur
     *       - in: path
     *         name: siteId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID du site
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
        authorize('Gestionnaire', 'Fournisseur'),
        updateFournisseurArticleStockValidator,
        validate,
        updateArticleStock
    )
    /**
     * @swagger
     * /stocks-fournisseurs/fournisseurs/{fournisseurId}/sites/{siteId}/articles/{articleId}:
     *   delete:
     *     summary: Supprimer un article du stock
     *     tags: [StocksFournisseurs]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: fournisseurId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID du fournisseur
     *       - in: path
     *         name: siteId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID du site
     *       - in: path
     *         name: articleId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID de l'article
     *     responses:
     *       200:
     *         description: Article supprimé avec succès
     *       403:
     *         description: Accès non autorisé
     *       404:
     *         description: Stock non trouvé
     */
    .delete(
        protect,
        authorize('Gestionnaire', 'Fournisseur'),
        deleteArticleFromStock
    );

// Routes pour le stock hebdomadaire par campagne
router
    .route('/fournisseurs/:fournisseurId/sites/:siteId/articles/:articleId/weekly')
    /**
     * @swagger
     * /stocks-fournisseurs/fournisseurs/{fournisseurId}/sites/{siteId}/articles/{articleId}/weekly:
     *   put:
     *     summary: Mettre à jour le stock hebdomadaire d'un article pour une campagne
     *     tags: [StocksFournisseurs]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: fournisseurId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID du fournisseur
     *       - in: path
     *         name: siteId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID du site
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
     *               campagne:
     *                 type: string
     *                 pattern: ^\d{2}-\d{2}$
     *                 description: Campagne (format "25-26")
     *               numeroSemaine:
     *                 type: number
     *                 minimum: 1
     *                 maximum: 52
     *                 description: Numéro de semaine (1-52)
     *               quantite:
     *                 type: number
     *                 minimum: 0
     *                 description: Quantité en stock
     *             required:
     *               - campagne
     *               - numeroSemaine
     *               - quantite
     *     responses:
     *       200:
     *         description: Stock hebdomadaire mis à jour avec succès
     *       400:
     *         description: Données invalides
     *       403:
     *         description: Accès non autorisé
     */
    .put(
        protect,
        authorize('Gestionnaire', 'Fournisseur'),
        updateWeeklyStockValidator,
        validate,
        updateWeeklyStock
    );

// Routes pour l'historique de campagne d'un article
router
    .route('/fournisseurs/:fournisseurId/sites/:siteId/articles/:articleId/campaigns/:campagne/history')
    /**
     * @swagger
     * /stocks-fournisseurs/fournisseurs/{fournisseurId}/sites/{siteId}/articles/{articleId}/campaigns/{campagne}/history:
     *   get:
     *     summary: Obtenir l'historique de stock d'un article pour une campagne
     *     tags: [StocksFournisseurs]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: fournisseurId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID du fournisseur
     *       - in: path
     *         name: siteId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID du site
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
     *           pattern: ^\d{2}-\d{2}$
     *         description: Campagne (format "25-26")
     *     responses:
     *       200:
     *         description: Historique de stock avec statistiques
     *       403:
     *         description: Accès non autorisé
     */
    .get(
        protect,
        authorize('Gestionnaire', 'Fournisseur', 'Station'),
        campaignParamValidator,
        validate,
        getArticleCampaignHistory
    );

// Routes pour les statistiques de campagne
router
    .route('/fournisseurs/:fournisseurId/sites/:siteId/campaigns/:campagne/stats')
    /**
     * @swagger
     * /stocks-fournisseurs/fournisseurs/{fournisseurId}/sites/{siteId}/campaigns/{campagne}/stats:
     *   get:
     *     summary: Obtenir les statistiques de stock pour une campagne
     *     tags: [StocksFournisseurs]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: fournisseurId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID du fournisseur
     *       - in: path
     *         name: siteId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID du site
     *       - in: path
     *         name: campagne
     *         required: true
     *         schema:
     *           type: string
     *           pattern: ^\d{2}-\d{2}$
     *         description: Campagne (format "25-26")
     *     responses:
     *       200:
     *         description: Statistiques détaillées par article et trimestre
     *       403:
     *         description: Accès non autorisé
     */
    .get(
        protect,
        authorize('Gestionnaire', 'Fournisseur', 'Station'),
        campaignParamValidator,
        validate,
        getCampaignStockStats
    );

// Route pour mettre à jour le stock complet d'une semaine
router
    .route('/fournisseurs/:fournisseurId/sites/:siteId/weekly')
    /**
     * @swagger
     * /stocks-fournisseurs/fournisseurs/{fournisseurId}/sites/{siteId}/weekly:
     *   put:
     *     summary: Mettre à jour le stock complet d'une semaine (tous les articles)
     *     tags: [StocksFournisseurs]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: fournisseurId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID du fournisseur
     *       - in: path
     *         name: siteId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID du site
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               campagne:
     *                 type: string
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
    .put(
        protect,
        authorize('Gestionnaire', 'Fournisseur'),
        updateCompleteWeeklyStockValidator,
        validate,
        updateCompleteWeeklyStock
    );

// Route pour obtenir le stock d'une semaine spécifique
router
    .route('/fournisseurs/:fournisseurId/sites/:siteId/weeks/:numeroSemaine')
    /**
     * @swagger
     * /stocks-fournisseurs/fournisseurs/{fournisseurId}/sites/{siteId}/weeks/{numeroSemaine}:
     *   get:
     *     summary: Obtenir le stock d'une semaine spécifique
     *     tags: [StocksFournisseurs]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: fournisseurId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID du fournisseur
     *       - in: path
     *         name: siteId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID du site
     *       - in: path
     *         name: numeroSemaine
     *         required: true
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 52
     *         description: Numéro de semaine
     *       - in: query
     *         name: campagne
     *         required: true
     *         schema:
     *           type: string
     *           example: "25-26"
     *         description: Campagne
     *     responses:
     *       200:
     *         description: Stock de la semaine récupéré avec succès
     *       400:
     *         description: Données invalides
     *       403:
     *         description: Accès non autorisé
     */
    .get(
        protect,
        authorize('Gestionnaire', 'Fournisseur'),
        getWeeklyStock
    );

module.exports = router;