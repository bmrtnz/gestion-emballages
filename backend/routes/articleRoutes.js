// backend/routes/articleRoutes.js
const express = require("express");
const router = express.Router();
const {
    createArticle,
    getArticles,
    addOrUpdateFournisseurForArticle,
    removeFournisseurFromArticle,
    updateFournisseurForArticle,
} = require("../controllers/articleController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const {
    createArticleValidator,
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
    .get(protect, getArticles)
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

module.exports = router;
