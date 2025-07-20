// backend/routes/previsionRoutes.js
const express = require("express");
const router = express.Router();
const {
    createPrevision,
    addArticlePrevision,
    updateArticlePrevision,
    getPrevisions,
    getPrevisionById,
    getSupplierPrevisions,
    deletePrevision,
    removeArticlePrevision
} = require("../controllers/previsionController");
const { protect, authorize } = require("../middleware/authMiddleware");
const paginationMiddleware = require("../middleware/paginationMiddleware");

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

// Toutes les routes nécessitent une authentification
router.use(protect);

router
    .route("/")
    /**
     * @swagger
     * /previsions:
     *   get:
     *     summary: Récupérer toutes les prévisions
     *     tags: [Prévisions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *         description: Numéro de la page
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *         description: Nombre d'éléments par page
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *         description: Terme de recherche
     *       - in: query
     *         name: campagne
     *         schema:
     *           type: string
     *         description: Filtrer par campagne
     *       - in: query
     *         name: fournisseurId
     *         schema:
     *           type: string
     *         description: Filtrer par fournisseur
     *     responses:
     *       200:
     *         description: Liste des prévisions récupérée avec succès.
     */
    .get(paginationMiddleware, getPrevisions)
    /**
     * @swagger
     * /previsions:
     *   post:
     *     summary: Créer une nouvelle prévision
     *     tags: [Prévisions]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               campagne:
     *                 type: string
     *               fournisseurId:
     *                 type: string
     *               siteId:
     *                 type: string
     *     responses:
     *       201:
     *         description: Prévision créée avec succès.
     */
    .post(authorize("Manager", "Gestionnaire"), createPrevision);

// Route pour récupérer les prévisions consolidées d'un fournisseur
router
    .route("/supplier/:fournisseurId/:campagne")
    /**
     * @swagger
     * /previsions/supplier/{fournisseurId}/{campagne}:
     *   get:
     *     summary: Récupérer toutes les prévisions d'un fournisseur pour une campagne
     *     tags: [Prévisions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: fournisseurId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID du fournisseur
     *       - in: path
     *         name: campagne
     *         schema:
     *           type: string
     *         required: true
     *         description: Campagne (ex. 25-26)
     *     responses:
     *       200:
     *         description: Prévisions du fournisseur récupérées avec succès.
     */
    .get(getSupplierPrevisions);

router
    .route("/:id")
    /**
     * @swagger
     * /previsions/{id}:
     *   get:
     *     summary: Récupérer une prévision spécifique
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
     *     responses:
     *       200:
     *         description: Prévision récupérée avec succès.
     */
    .get(getPrevisionById)
    /**
     * @swagger
     * /previsions/{id}:
     *   delete:
     *     summary: Supprimer une prévision
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
     *     responses:
     *       200:
     *         description: Prévision supprimée avec succès.
     */
    .delete(authorize("Manager", "Gestionnaire"), deletePrevision);

// Routes pour gérer les articles dans une prévision
router
    .route("/:id/articles")
    /**
     * @swagger
     * /previsions/{id}/articles:
     *   post:
     *     summary: Ajouter une prévision d'article à une prévision
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
     *               articleId:
     *                 type: string
     *               annee:
     *                 type: number
     *               semaines:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     numeroSemaine:
     *                       type: number
     *                     quantitePrevue:
     *                       type: number
     *     responses:
     *       200:
     *         description: Article ajouté à la prévision avec succès.
     */
    .post(authorize("Manager", "Gestionnaire"), addArticlePrevision);

router
    .route("/:id/articles/:articlePrevisionId")
    /**
     * @swagger
     * /previsions/{id}/articles/{articlePrevisionId}:
     *   put:
     *     summary: Mettre à jour une prévision d'article
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
     *       - in: path
     *         name: articlePrevisionId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de la prévision d'article
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               semaines:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     numeroSemaine:
     *                       type: number
     *                     quantitePrevue:
     *                       type: number
     *     responses:
     *       200:
     *         description: Prévision d'article mise à jour avec succès.
     */
    .put(authorize("Manager", "Gestionnaire"), updateArticlePrevision)
    /**
     * @swagger
     * /previsions/{id}/articles/{articlePrevisionId}:
     *   delete:
     *     summary: Supprimer une prévision d'article
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
     *       - in: path
     *         name: articlePrevisionId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de la prévision d'article
     *     responses:
     *       200:
     *         description: Prévision d'article supprimée avec succès.
     */
    .delete(authorize("Manager", "Gestionnaire"), removeArticlePrevision);

module.exports = router;
