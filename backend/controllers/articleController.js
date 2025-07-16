/**
 * @fileoverview Contrôleur pour la gestion des articles
 * @module controllers/articleController
 * @requires models/articleModel
 * @requires models/fournisseurModel
 * @requires utils/appError
 * @author Gestion Emballages Team
 * @since 1.0.0
 */

// backend/controllers/articleController.js
const Article = require("../models/articleModel");
const Fournisseur = require("../models/fournisseurModel");
// Removed asyncHandler for cleaner testing and error handling
const { NotFoundError, ValidationError } = require("../utils/appError");

/**
 * Créer un nouvel article.
 * @function createArticle
 * @memberof module:controllers/articleController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.codeArticle - Code unique de l'article
 * @param {string} req.body.designation - Désignation de l'article
 * @param {string} [req.body.categorie] - Catégorie de l'article
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie l'article créé avec le statut 201
 * @throws {ValidationError} Si les champs requis sont manquants
 * @since 1.0.0
 * @example
 * // POST /api/articles
 * // Body: { "codeArticle": "ART001", "designation": "Carton 40x30x20", "categorie": "Emballage" }
 * // Response: { "_id": "...", "codeArticle": "ART001", "designation": "Carton 40x30x20", "categorie": "Emballage", "isActive": true, "fournisseurs": [] }
 */
exports.createArticle = async (req, res, next) => {
    try {
    // Extraction des données du corps de la requête.
    const { codeArticle, designation, categorie } = req.body;
    // Création de l'article dans la base de données.
    const article = await Article.create({
        codeArticle,
        designation,
        categorie,
    });
    // Envoi de la réponse avec le nouvel article et le statut 201 (Créé).
    res.status(201).json(article);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtenir tous les articles actifs.
 * @function getArticles
 * @memberof module:controllers/articleController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la liste de tous les articles actifs avec leurs fournisseurs
 * @since 1.0.0
 * @example
 * // GET /api/articles
 * // Response: [{ "_id": "...", "codeArticle": "ART001", "designation": "Carton 40x30x20", "categorie": "Emballage", "fournisseurs": [...] }]
 */
exports.getArticles = async (req, res, next) => {
    try {
    // Recherche de tous les articles marqués comme actifs.
    // Les post-hooks du modèle gèrent automatiquement la population des fournisseurs.
    const articles = await Article.find({ isActive: true });
    // Envoi de la liste des articles en réponse.
    res.json(articles);
    } catch (error) {
        next(error);
    }
};

/**
 * Ajouter ou mettre à jour les informations d'un fournisseur pour un article spécifique.
 * @function addOrUpdateFournisseurForArticle
 * @memberof module:controllers/articleController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de l'article
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.fournisseurId - ID du fournisseur
 * @param {number} req.body.prixUnitaire - Prix unitaire de l'article chez ce fournisseur
 * @param {string} [req.body.referenceFournisseur] - Référence de l'article chez le fournisseur
 * @param {string} [req.body.uniteConditionnement] - Unité de conditionnement
 * @param {number} [req.body.quantiteParConditionnement] - Quantité par conditionnement
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie l'article mis à jour avec ses fournisseurs
 * @throws {ValidationError} Si les champs requis sont manquants
 * @throws {NotFoundError} Si l'article ou le fournisseur n'est pas trouvé
 * @since 1.0.0
 * @example
 * // POST /api/articles/64f5a1b2c3d4e5f6a7b8c9d0/fournisseurs
 * // Body: { "fournisseurId": "64f5a1b2c3d4e5f6a7b8c9d1", "prixUnitaire": 15.50, "referenceFournisseur": "REF001" }
 * // Response: { "_id": "...", "codeArticle": "ART001", "fournisseurs": [{ "fournisseurId": "...", "prixUnitaire": 15.50, ... }] }
 */
exports.addOrUpdateFournisseurForArticle = async (req, res, next) => {
    try {
    // Extraction des données du fournisseur depuis le corps de la requête.
    const { fournisseurId, prixUnitaire, referenceFournisseur, uniteConditionnement, quantiteParConditionnement } =
        req.body;

    // Validation des données requises
    if (!fournisseurId || !prixUnitaire) {
        return next(new ValidationError("fournisseurId et prixUnitaire sont requis"));
    }

    // Vérification que le fournisseur existe
    const fournisseur = await Fournisseur.findById(fournisseurId);
    if (!fournisseur || !fournisseur.isActive) {
        return next(new NotFoundError("Fournisseur non trouvé ou inactif"));
    }

    // Recherche de l'article par son ID.
    const article = await Article.findById(req.params.id);

    // Si l'article n'est pas trouvé, une erreur 404 est levée.
    if (!article) {
        return next(new NotFoundError("Article non trouvé"));
    }

    // Vérification si le fournisseur existe déjà pour cet article.
    const existingFournisseur = article.fournisseurs.find((f) => f.fournisseurId.toString() === fournisseurId);

    if (existingFournisseur) {
        // Si le fournisseur existe, mise à jour de ses informations.
        existingFournisseur.prixUnitaire = prixUnitaire;
        existingFournisseur.referenceFournisseur = referenceFournisseur;
        existingFournisseur.uniteConditionnement = uniteConditionnement;
        existingFournisseur.quantiteParConditionnement = quantiteParConditionnement;
    } else {
        // Sinon, ajout du nouveau fournisseur à la liste des fournisseurs de l'article.
        article.fournisseurs.push({
            fournisseurId,
            prixUnitaire,
            referenceFournisseur,
            uniteConditionnement,
            quantiteParConditionnement,
        });
    }

    // Sauvegarde de l'article mis à jour.
    await article.save();

    // Récupération de l'article mis à jour avec population automatique via post-hooks
    const updatedArticle = await Article.findById(article._id);
    
    // Envoi de l'article mis à jour en réponse.
    res.json(updatedArticle);
    } catch (error) {
        next(error);
    }
};

/**
 * Supprimer le lien entre un fournisseur et un article.
 * @function removeFournisseurFromArticle
 * @memberof module:controllers/articleController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de l'article
 * @param {string} req.params.fournisseurInfoId - ID de l'information fournisseur à supprimer
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie l'article mis à jour sans le fournisseur supprimé
 * @throws {NotFoundError} Si l'article n'est pas trouvé
 * @since 1.0.0
 * @example
 * // DELETE /api/articles/64f5a1b2c3d4e5f6a7b8c9d0/fournisseurs/64f5a1b2c3d4e5f6a7b8c9d1
 * // Response: { "_id": "...", "codeArticle": "ART001", "fournisseurs": [...] }
 */
exports.removeFournisseurFromArticle = async (req, res, next) => {
    try {
    // Extraction de l'ID de l'article et de l'ID de l'information fournisseur.
    const { id: articleId, fournisseurInfoId } = req.params;

    // Utilisation de findByIdAndUpdate avec l'opérateur $pull pour retirer
    // l'objet correspondant du tableau 'fournisseurs'.
    const updatedArticle = await Article.findByIdAndUpdate(
        articleId,
        { $pull: { fournisseurs: { _id: fournisseurInfoId } } },
        { new: true } // 'new: true' assure que le document retourné est la version mise à jour.
    );

    // Si l'article n'est pas trouvé, une erreur 404 est levée.
    if (!updatedArticle) {
        return next(new NotFoundError("Article non trouvé"));
    }

    // Les post-hooks gèrent automatiquement la population des fournisseurs.
    // Envoi de l'article mis à jour.
    res.json(updatedArticle);
    } catch (error) {
        next(error);
    }
};

/**
 * Mettre à jour les informations d'un fournisseur pour un article.
 * @function updateFournisseurForArticle
 * @memberof module:controllers/articleController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de l'article
 * @param {string} req.params.fournisseurInfoId - ID de l'information fournisseur à mettre à jour
 * @param {Object} req.body - Corps de la requête
 * @param {number} [req.body.prixUnitaire] - Nouveau prix unitaire
 * @param {string} [req.body.referenceFournisseur] - Nouvelle référence fournisseur
 * @param {string} [req.body.uniteConditionnement] - Nouvelle unité de conditionnement
 * @param {number} [req.body.quantiteParConditionnement] - Nouvelle quantité par conditionnement
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie l'article avec les informations fournisseur mises à jour
 * @throws {NotFoundError} Si l'article ou l'information fournisseur n'est pas trouvé
 * @since 1.0.0
 * @example
 * // PUT /api/articles/64f5a1b2c3d4e5f6a7b8c9d0/fournisseurs/64f5a1b2c3d4e5f6a7b8c9d1
 * // Body: { "prixUnitaire": 18.75, "referenceFournisseur": "REF001-V2" }
 * // Response: { "_id": "...", "codeArticle": "ART001", "fournisseurs": [{ "_id": "...", "prixUnitaire": 18.75, ... }] }
 */
exports.updateFournisseurForArticle = async (req, res, next) => {
    try {
    // Extraction des IDs et des données à mettre à jour.
    const { id: articleId, fournisseurInfoId } = req.params;
    const { prixUnitaire, referenceFournisseur, uniteConditionnement, quantiteParConditionnement } = req.body;

    // Recherche de l'article parent.
    const article = await Article.findById(articleId);

    if (!article) {
        return next(new NotFoundError("Article non trouvé"));
    }

    // Recherche du sous-document fournisseur par son ID.
    const fournisseurInfo = article.fournisseurs.id(fournisseurInfoId);

    if (!fournisseurInfo) {
        return next(new NotFoundError("Lien fournisseur non trouvé"));
    }

    // Mise à jour de tous les champs fournis.
    if (prixUnitaire !== undefined) fournisseurInfo.prixUnitaire = prixUnitaire;
    if (referenceFournisseur !== undefined) fournisseurInfo.referenceFournisseur = referenceFournisseur;
    if (uniteConditionnement !== undefined) fournisseurInfo.uniteConditionnement = uniteConditionnement;
    if (quantiteParConditionnement !== undefined) fournisseurInfo.quantiteParConditionnement = quantiteParConditionnement;

    // Sauvegarde de l'article parent pour appliquer les modifications.
    await article.save();

    // Récupération de l'article mis à jour avec population automatique via post-hooks
    const updatedArticle = await Article.findById(articleId);

    // Envoi de l'article mis à jour.
    res.json(updatedArticle);
    } catch (error) {
        next(error);
    }
};
