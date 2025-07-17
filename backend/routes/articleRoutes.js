// backend/routes/articleRoutes.js
const express = require("express");
const router = express.Router();
const {
    createArticle,
    getArticles,
    getArticleById,
    updateArticle,
    deleteArticle,
    addOrUpdateFournisseurForArticle,
    removeFournisseurFromArticle,
    updateFournisseurForArticle,
    getCategories,
    uploadFournisseurImage,
    deleteFournisseurImage,
    uploadImageMiddleware,
} = require("../controllers/articleController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const paginationMiddleware = require("../middleware/paginationMiddleware");
const {
    createArticleValidator,
    updateArticleValidator,
    addFournisseurValidator,
    updateFournisseurValidator,
} = require("../validators/articleValidators");

/**
 * @fileoverview Routes pour la gestion des articles.
 * @module routes/articleRoutes
 */

/**
 * @swagger
 * tags:
 *   name: Articles
 *   description: Gestion du catalogue d'articles
 */

const managerOnly = [protect, authorize("Manager", "Gestionnaire")];

/**
 * @swagger
 * /articles/categories:
 *   get:
 *     summary: Récupérer toutes les catégories d'articles disponibles
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des catégories disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["Barquette", "Cagette", "Plateau"]
 */
router.get("/categories", protect, getCategories);

router
    .route("/")
    /**
     * @swagger
     * /articles:
     *   get:
     *     summary: Récupérer la liste des articles actifs
     *     tags: [Articles]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Une liste d'articles.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Article'
     */
    .get(protect, paginationMiddleware, getArticles)
    /**
     * @swagger
     * /articles:
     *   post:
     *     summary: Créer un nouvel article
     *     tags: [Articles]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Article'
     *     responses:
     *       201:
     *         description: Article créé avec succès.
     *       400:
     *         description: Données d'entrée invalides.
     */
    .post(...managerOnly, createArticleValidator, validate, createArticle);

router
    .route("/:id")
    /**
     * @swagger
     * /articles/{id}:
     *   get:
     *     summary: Récupérer un article par son ID
     *     tags: [Articles]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de l'article
     *     responses:
     *       200:
     *         description: Article trouvé.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Article'
     *       404:
     *         description: Article non trouvé.
     */
    .get(protect, getArticleById)
    /**
     * @swagger
     * /articles/{id}:
     *   put:
     *     summary: Mettre à jour un article
     *     tags: [Articles]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de l'article
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Article'
     *     responses:
     *       200:
     *         description: Article mis à jour avec succès.
     *       404:
     *         description: Article non trouvé.
     */
    .put(...managerOnly, updateArticleValidator, validate, updateArticle)
    /**
     * @swagger
     * /articles/{id}:
     *   delete:
     *     summary: Supprimer un article (désactivation)
     *     tags: [Articles]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de l'article
     *     responses:
     *       200:
     *         description: Article supprimé avec succès.
     *       404:
     *         description: Article non trouvé.
     */
    .delete(...managerOnly, deleteArticle);

router
    .route("/:id/fournisseurs")
    /**
     * @swagger
     * /articles/{id}/fournisseurs:
     *   post:
     *     summary: Ajouter ou mettre à jour un fournisseur pour un article
     *     tags: [Articles]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de l'article
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/FournisseurInfo'
     *     responses:
     *       200:
     *         description: Article mis à jour avec succès.
     *       404:
     *         description: Article non trouvé.
     */
    .post(
        ...managerOnly,
        addFournisseurValidator,
        validate,
        addOrUpdateFournisseurForArticle
    );

router
    .route("/:id/fournisseurs/:fournisseurInfoId")
    /**
     * @swagger
     * /articles/{id}/fournisseurs/{fournisseurInfoId}:
     *   put:
     *     summary: Mettre à jour les informations d'un fournisseur pour un article
     *     tags: [Articles]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de l'article
     *       - in: path
     *         name: fournisseurInfoId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de l'information fournisseur
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/FournisseurInfo'
     *     responses:
     *       200:
     *         description: Article mis à jour avec succès.
     *       404:
     *         description: Article ou lien fournisseur non trouvé.
     */
    .put(
        ...managerOnly,
        updateFournisseurValidator,
        validate,
        updateFournisseurForArticle
    )
    /**
     * @swagger
     * /articles/{id}/fournisseurs/{fournisseurInfoId}:
     *   delete:
     *     summary: Supprimer le lien entre un fournisseur et un article
     *     tags: [Articles]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de l'article
     *       - in: path
     *         name: fournisseurInfoId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de l'information fournisseur
     *     responses:
     *       200:
     *         description: Lien fournisseur supprimé avec succès.
     *       404:
     *         description: Article non trouvé.
     */
    .delete(...managerOnly, removeFournisseurFromArticle);

// Image upload routes
router
    .route("/:id/fournisseurs/:fournisseurId/image")
    /**
     * @swagger
     * /articles/{id}/fournisseurs/{fournisseurId}/image:
     *   post:
     *     summary: Uploader une image pour un fournisseur d'article
     *     tags: [Articles]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de l'article
     *       - in: path
     *         name: fournisseurId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID du fournisseur
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               image:
     *                 type: string
     *                 format: binary
     *                 description: Fichier image (JPEG, PNG, GIF, WebP)
     *     responses:
     *       200:
     *         description: Image uploadée avec succès
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 imageUrl:
     *                   type: string
     *       400:
     *         description: Fichier invalide ou manquant
     *       404:
     *         description: Article ou fournisseur non trouvé
     */
    .post(...managerOnly, uploadImageMiddleware, uploadFournisseurImage)
    /**
     * @swagger
     * /articles/{id}/fournisseurs/{fournisseurId}/image:
     *   delete:
     *     summary: Supprimer l'image d'un fournisseur d'article
     *     tags: [Articles]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: ID de l'article
     *       - in: path
     *         name: fournisseurId
     *         schema:
     *           type: string
     *         required: true
     *         description: ID du fournisseur
     *     responses:
     *       200:
     *         description: Image supprimée avec succès
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *       404:
     *         description: Article, fournisseur ou image non trouvé
     */
    .delete(...managerOnly, deleteFournisseurImage);

module.exports = router;
