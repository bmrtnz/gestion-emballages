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
const { NotFoundError, ValidationError, BadRequestError } = require("../utils/appError");
const { ARTICLE_CATEGORIES } = require("../utils/constants");
const { minioClient, bucketName } = require('../config/minioClient');
const config = require('../config/env');
const { normalizeImageUrl } = require('../utils/urlHelper');
const multer = require('multer');
const path = require('path');

/**
 * Normalize image URLs in articles for frontend access
 * @param {Array|Object} articles - Article(s) to normalize
 * @returns {Array|Object} - Normalized article(s)
 */
const normalizeArticleImageUrls = (articles) => {
    const normalizeArticle = (article) => {
        if (article.fournisseurs && Array.isArray(article.fournisseurs)) {
            article.fournisseurs.forEach(fournisseur => {
                if (fournisseur.imageUrl) {
                    fournisseur.imageUrl = normalizeImageUrl(fournisseur.imageUrl);
                }
            });
        }
        return article;
    };

    if (Array.isArray(articles)) {
        return articles.map(normalizeArticle);
    } else if (articles && typeof articles === 'object') {
        return normalizeArticle(articles);
    }
    
    return articles;
};

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Seuls les fichiers image (JPEG, PNG, GIF, WebP) sont autorisés'), false);
    }
  }
});

exports.uploadImageMiddleware = upload.single('image');

/**
 * Obtenir toutes les catégories d'articles disponibles.
 * @function getCategories
 * @memberof module:controllers/articleController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la liste des catégories disponibles
 * @since 1.0.0
 * @example
 * // GET /api/articles/categories
 * // Response: ["Barquette", "Cagette", "Plateau", ...]
 */
exports.getCategories = async (req, res, next) => {
    try {
        res.json(ARTICLE_CATEGORIES);
    } catch (error) {
        next(error);
    }
};

/**
 * Récupérer les catégories distinctes disponibles dans le dataset filtré
 * @function getDistinctCategories
 * @memberof module:controllers/articleController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.query - Paramètres de requête
 * @param {string} [req.query.search] - Terme de recherche
 * @param {string} [req.query.status] - Filtre de statut (active/inactive)
 * @param {string} [req.query.fournisseur] - Filtre par fournisseur
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie les catégories distinctes
 * @since 1.0.0
 */
exports.getDistinctCategories = async (req, res, next) => {
    try {
        const { search, status, fournisseur } = req.query;
        
        // Construction de la query de base (sans filtre de catégorie)
        let query = {};
        
        // Filter by supplier if user is a Fournisseur
        if (req.user.role === 'Fournisseur') {
            query['fournisseurs.fournisseurId'] = req.user.entiteId;
            // For Fournisseur users, show only active articles by default
            if (!status || status === 'active') {
                query.isActive = true;
            } else if (status === 'inactive') {
                query.isActive = false;
            }
        } else {
            // For non-Fournisseur users, apply standard status filtering
            if (status === 'active') {
                query.isActive = true;
            } else if (status === 'inactive') {
                query.isActive = false;
            }
        }
        
        // Ajout de la recherche textuelle
        if (search) {
            query.$or = [
                { codeArticle: { $regex: search, $options: 'i' } },
                { designation: { $regex: search, $options: 'i' } },
                { categorie: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Filtrage par fournisseur si spécifié
        if (fournisseur) {
            const articlesWithSuppliers = await Article.aggregate([
                { $match: query },
                { $lookup: {
                    from: 'fournisseurs',
                    localField: 'fournisseurs.fournisseurId',
                    foreignField: '_id',
                    as: 'fournisseurDetails'
                }},
                { $match: {
                    'fournisseurDetails.nom': { $regex: fournisseur, $options: 'i' }
                }},
                { $group: {
                    _id: '$categorie',
                    count: { $sum: 1 }
                }},
                { $match: { _id: { $ne: null, $ne: '' } } },
                { $sort: { _id: 1 } }
            ]);
            
            const categories = articlesWithSuppliers.map(item => item._id);
            return res.json({ categories });
        }
        
        // Récupération des catégories distinctes
        const distinctCategories = await Article.distinct('categorie', query);
        
        // Filtrer les valeurs null/vides et trier
        const categories = distinctCategories
            .filter(cat => cat && cat.trim())
            .sort();
        
        res.json({ categories });
    } catch (error) {
        next(error);
    }
};

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
 * Obtenir tous les articles actifs avec pagination, recherche et filtres.
 * @function getArticles
 * @memberof module:controllers/articleController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.pagination - Paramètres de pagination ajoutés par le middleware
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la liste paginée des articles avec métadonnées
 * @since 1.0.0
 * @example
 * // GET /api/articles?page=2&limit=20&search=barquette&categorie=Emballage
 * // Response: { data: [...], pagination: { currentPage: 2, totalPages: 5, ... }, filters: { search: 'barquette', ... } }
 */
/**
 * Get all active articles without pagination (for forms/selects)
 * @route GET /api/articles/all-active
 * @access Private
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAllActiveArticles = async (req, res, next) => {
    console.log('[getAllActiveArticles] Route handler called!'); // Debug log
    
    try {
        console.log('[getAllActiveArticles] Starting query for all active articles...'); // Debug log
        
        // Check if suppliers data is requested
        const includeSuppliers = req.query.includeSuppliers === 'true';
        console.log(`[getAllActiveArticles] Include suppliers: ${includeSuppliers}`); // Debug log
        
        // Get count first for debugging
        const count = await Article.countDocuments({ isActive: true });
        console.log(`[getAllActiveArticles] Found ${count} active articles in database`); // Debug log
        
        let articles;
        
        if (includeSuppliers) {
            // Use full Mongoose query - let the hooks handle population
            articles = await Article.find({ isActive: true })
                .select('_id designation codeArticle categorie conditionnement quantiteParConditionnement fournisseurs')
                .sort({ designation: 1 });
            
            // Convert to plain objects and normalize image URLs
            articles = articles.map(article => article.toObject());
            articles = normalizeArticleImageUrls(articles);
        } else {
            // Use aggregation for simple data (original behavior)
            articles = await Article.aggregate([
                { $match: { isActive: true } },
                { $project: { 
                    _id: 1, 
                    designation: 1, 
                    codeArticle: 1, 
                    categorie: 1 
                }},
                { $sort: { designation: 1 } }
            ]);
        }

        console.log(`[getAllActiveArticles] Successfully retrieved ${articles.length} articles`); // Debug log

        res.status(200).json({
            success: true,
            data: articles,
            count: articles.length
        });
    } catch (error) {
        console.error('[getAllActiveArticles] Error occurred:', error); // Debug log
        console.error('[getAllActiveArticles] Error stack:', error.stack); // Debug log
        next(error);
    }
};

exports.getArticles = async (req, res, next) => {
    try {
        const { page, limit, skip, search, sortBy, sortOrder, filters } = req.pagination;
        
        // Construction de la query de base
        let query = {};
        
        // Filter by supplier if user is a Fournisseur
        if (req.user.role === 'Fournisseur') {
            query['fournisseurs.fournisseurId'] = req.user.entiteId;
            // For Fournisseur users, show only active articles by default
            if (!filters.status || filters.status === 'active') {
                query.isActive = true;
            } else if (filters.status === 'inactive') {
                query.isActive = false;
            }
        } else {
            // For non-Fournisseur users, apply standard status filtering
            if (filters.status === 'active') {
                query.isActive = true;
            } else if (filters.status === 'inactive') {
                query.isActive = false;
            }
            // Si status est vide ou 'tout', on ne filtre pas sur isActive (on affiche tout)
        }
        
        // Ajout de la recherche textuelle
        if (search) {
            query.$or = [
                { codeArticle: { $regex: search, $options: 'i' } },
                { designation: { $regex: search, $options: 'i' } },
                { categorie: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Ajout des filtres
        if (filters.categorie) {
            query.categorie = filters.categorie;
        }
        
        if (filters.fournisseur) {
            // Filtrage par nom de fournisseur (nécessite une aggregation)
            const fournisseurFilter = filters.fournisseur;
            const articlesWithSuppliers = await Article.aggregate([
                { $match: query },
                { $lookup: {
                    from: 'fournisseurs',
                    localField: 'fournisseurs.fournisseurId',
                    foreignField: '_id',
                    as: 'fournisseurDetails'
                }},
                { $match: {
                    'fournisseurDetails.nom': { $regex: fournisseurFilter, $options: 'i' }
                }},
                { $sort: { [sortBy]: sortOrder } },
                { $skip: skip },
                { $limit: limit }
            ]);
            
            // Compter le total pour la pagination
            const totalCount = await Article.aggregate([
                { $match: query },
                { $lookup: {
                    from: 'fournisseurs',
                    localField: 'fournisseurs.fournisseurId',
                    foreignField: '_id',
                    as: 'fournisseurDetails'
                }},
                { $match: {
                    'fournisseurDetails.nom': { $regex: fournisseurFilter, $options: 'i' }
                }},
                { $count: 'total' }
            ]);
            
            const total = totalCount.length > 0 ? totalCount[0].total : 0;
            
            // Récupérer les articles complets avec population
            const articleIds = articlesWithSuppliers.map(a => a._id);
            let articles = await Article.find({ _id: { $in: articleIds } })
                .sort({ [sortBy]: sortOrder });
            
            // Filter supplier data if user is a Fournisseur
            if (req.user.role === 'Fournisseur') {
                articles = articles.map(article => {
                    const filteredArticle = article.toObject();
                    filteredArticle.fournisseurs = filteredArticle.fournisseurs.filter(
                        supplier => {
                            // Handle both populated and non-populated fournisseurId
                            const supplierId = supplier.fournisseurId?._id || supplier.fournisseurId;
                            return supplierId && supplierId.toString() === req.user.entiteId.toString();
                        }
                    );
                    return filteredArticle;
                });
            }
            
            // Get available suppliers for current filter context (excluding supplier filter)
            let supplierQuery = {};
            
            // Apply status filter consistent with main query logic
            if (req.user.role === 'Fournisseur') {
                // For Fournisseur users, show only active articles by default
                if (!filters.status || filters.status === 'active') {
                    supplierQuery.isActive = true;
                } else if (filters.status === 'inactive') {
                    supplierQuery.isActive = false;
                }
            } else {
                // For non-Fournisseur users, apply standard status filtering
                if (filters.status === 'active') {
                    supplierQuery.isActive = true;
                } else if (filters.status === 'inactive') {
                    supplierQuery.isActive = false;
                }
                // If status is empty or 'tout', don't filter on isActive (show all)
            }
            
            // Apply search filter
            if (search) {
                supplierQuery.$or = [
                    { codeArticle: { $regex: search, $options: 'i' } },
                    { designation: { $regex: search, $options: 'i' } },
                    { categorie: { $regex: search, $options: 'i' } }
                ];
            }
            
            // Apply category filter
            if (filters.categorie) {
                supplierQuery.categorie = filters.categorie;
            }
            
            // Note: We intentionally exclude the supplier filter here
            const availableSuppliers = await Article.aggregate([
                { $match: supplierQuery },
                { $unwind: '$fournisseurs' },
                { $lookup: {
                    from: 'fournisseurs',
                    localField: 'fournisseurs.fournisseurId',
                    foreignField: '_id',
                    as: 'supplierInfo'
                }},
                { $unwind: '$supplierInfo' },
                { $group: {
                    _id: '$supplierInfo.nom',
                    count: { $sum: 1 }
                }},
                { $sort: { _id: 1 } }
            ]);
            
            const supplierNames = availableSuppliers.map(s => s._id);
            
            
            const normalizedArticles = normalizeArticleImageUrls(articles);
            return res.json(req.pagination.buildResponse(normalizedArticles, total, { availableSuppliers: supplierNames }));
        }
        
        // Requête standard sans filtrage par fournisseur
        let articles = await Article.find(query)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);
        
        // Filter supplier data if user is a Fournisseur
        if (req.user.role === 'Fournisseur') {
            articles = articles.map(article => {
                const filteredArticle = article.toObject();
                filteredArticle.fournisseurs = filteredArticle.fournisseurs.filter(
                    supplier => {
                        // Handle both populated and non-populated fournisseurId
                        const supplierId = supplier.fournisseurId?._id || supplier.fournisseurId;
                        return supplierId && supplierId.toString() === req.user.entiteId.toString();
                    }
                );
                return filteredArticle;
            });
        }
        
        const totalCount = await Article.countDocuments(query);
        
        // Get available suppliers for current filter context (excluding supplier filter)
        let supplierQuery = {};
        
        // Apply status filter consistent with main query logic
        if (req.user.role === 'Fournisseur') {
            // For Fournisseur users, show only active articles by default
            if (!filters.status || filters.status === 'active') {
                supplierQuery.isActive = true;
            } else if (filters.status === 'inactive') {
                supplierQuery.isActive = false;
            }
        } else {
            // For non-Fournisseur users, apply standard status filtering
            if (filters.status === 'active') {
                supplierQuery.isActive = true;
            } else if (filters.status === 'inactive') {
                supplierQuery.isActive = false;
            }
            // If status is empty or 'tout', don't filter on isActive (show all)
        }
        
        // Apply search filter
        if (search) {
            supplierQuery.$or = [
                { codeArticle: { $regex: search, $options: 'i' } },
                { designation: { $regex: search, $options: 'i' } },
                { categorie: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Apply category filter
        if (filters.categorie) {
            supplierQuery.categorie = filters.categorie;
        }
        
        // Note: We intentionally exclude the supplier filter here
        const availableSuppliers = await Article.aggregate([
            { $match: supplierQuery },
            { $unwind: '$fournisseurs' },
            { $lookup: {
                from: 'fournisseurs',
                localField: 'fournisseurs.fournisseurId',
                foreignField: '_id',
                as: 'supplierInfo'
            }},
            { $unwind: '$supplierInfo' },
            { $group: {
                _id: '$supplierInfo.nom',
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);
        
        const supplierNames = availableSuppliers.map(s => s._id);
        
        
        const normalizedArticles = normalizeArticleImageUrls(articles);
        res.json(req.pagination.buildResponse(normalizedArticles, totalCount, { availableSuppliers: supplierNames }));
    } catch (error) {
        next(error);
    }
};

/**
 * Obtenir un article par son ID.
 * @function getArticleById
 * @memberof module:controllers/articleController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de l'article
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie l'article avec ses fournisseurs
 * @throws {NotFoundError} Si l'article n'est pas trouvé
 * @since 1.0.0
 * @example
 * // GET /api/articles/64f5a1b2c3d4e5f6a7b8c9d0
 * // Response: { "_id": "...", "codeArticle": "ART001", "designation": "Carton 40x30x20", "fournisseurs": [...] }
 */
exports.getArticleById = async (req, res, next) => {
    try {
        let article = await Article.findById(req.params.id);
        
        if (!article) {
            return next(new NotFoundError("Article non trouvé"));
        }
        
        // For Fournisseur users, check if they are linked to this article
        if (req.user.role === 'Fournisseur') {
            const hasAccess = article.fournisseurs.some(
                supplier => {
                    const supplierId = supplier.fournisseurId?._id || supplier.fournisseurId;
                    return supplierId && supplierId.toString() === req.user.entiteId.toString();
                }
            );
            
            if (!hasAccess) {
                return next(new NotFoundError("Article non trouvé"));
            }
            
            // Filter to show only their supplier data
            const filteredArticle = article.toObject();
            filteredArticle.fournisseurs = filteredArticle.fournisseurs.filter(
                supplier => {
                    const supplierId = supplier.fournisseurId?._id || supplier.fournisseurId;
                    return supplierId && supplierId.toString() === req.user.entiteId.toString();
                }
            );
            article = filteredArticle;
        }
        
        const normalizedArticle = normalizeArticleImageUrls(article);
        res.json(normalizedArticle);
    } catch (error) {
        next(error);
    }
};

/**
 * Mettre à jour un article.
 * @function updateArticle
 * @memberof module:controllers/articleController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de l'article
 * @param {Object} req.body - Corps de la requête
 * @param {string} [req.body.codeArticle] - Nouveau code de l'article
 * @param {string} [req.body.designation] - Nouvelle désignation
 * @param {string} [req.body.categorie] - Nouvelle catégorie
 * @param {boolean} [req.body.isActive] - Statut actif/inactif
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie l'article mis à jour
 * @throws {NotFoundError} Si l'article n'est pas trouvé
 * @since 1.0.0
 * @example
 * // PUT /api/articles/64f5a1b2c3d4e5f6a7b8c9d0
 * // Body: { "designation": "Nouveau nom", "categorie": "Nouvelle catégorie" }
 * // Response: { "_id": "...", "codeArticle": "ART001", "designation": "Nouveau nom", ... }
 */
exports.updateArticle = async (req, res, next) => {
    try {
        const { codeArticle, designation, categorie, isActive } = req.body;
        
        const updatedArticle = await Article.findByIdAndUpdate(
            req.params.id,
            { 
                ...(codeArticle && { codeArticle }),
                ...(designation && { designation }),
                ...(categorie && { categorie }),
                ...(isActive !== undefined && { isActive })
            },
            { new: true, runValidators: true }
        );
        
        if (!updatedArticle) {
            return next(new NotFoundError("Article non trouvé"));
        }
        
        const normalizedArticle = normalizeArticleImageUrls(updatedArticle);
        res.json(normalizedArticle);
    } catch (error) {
        next(error);
    }
};

/**
 * Supprimer un article (désactivation).
 * @function deleteArticle
 * @memberof module:controllers/articleController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de l'article
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Confirmation de la suppression
 * @throws {NotFoundError} Si l'article n'est pas trouvé
 * @since 1.0.0
 * @example
 * // DELETE /api/articles/64f5a1b2c3d4e5f6a7b8c9d0
 * // Response: { "message": "Article supprimé avec succès" }
 */
exports.deleteArticle = async (req, res, next) => {
    try {
        const article = await Article.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        
        if (!article) {
            return next(new NotFoundError("Article non trouvé"));
        }
        
        res.json({ message: "Article supprimé avec succès" });
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
 * @param {number} [req.body.delaiIndicatifApprovisionnement] - Délai indicatif d'approvisionnement en jours
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
    const { fournisseurId, prixUnitaire, referenceFournisseur, uniteConditionnement, quantiteParConditionnement, delaiIndicatifApprovisionnement } =
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
        existingFournisseur.delaiIndicatifApprovisionnement = delaiIndicatifApprovisionnement;
    } else {
        // Sinon, ajout du nouveau fournisseur à la liste des fournisseurs de l'article.
        article.fournisseurs.push({
            fournisseurId,
            prixUnitaire,
            referenceFournisseur,
            uniteConditionnement,
            quantiteParConditionnement,
            delaiIndicatifApprovisionnement,
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

    // D'abord, récupérer l'article pour vérifier s'il y a une image à supprimer
    const article = await Article.findById(articleId);
    if (!article) {
        return next(new NotFoundError("Article non trouvé"));
    }

    // Trouver le lien fournisseur pour vérifier s'il a une image
    const supplierLink = article.fournisseurs.find(f => f._id.toString() === fournisseurInfoId);
    
    // Si le lien a une image, la supprimer de MinIO
    if (supplierLink && supplierLink.imageUrl) {
        const urlParts = supplierLink.imageUrl.split(`/${bucketName}/`);
        if (urlParts.length > 1) {
            const objectName = urlParts[1];
            try {
                await minioClient.removeObject(bucketName, objectName);
            } catch (error) {
                console.warn('Erreur lors de la suppression de l\'image:', error);
            }
        }
    }

    // Utilisation de findByIdAndUpdate avec l'opérateur $pull pour retirer
    // l'objet correspondant du tableau 'fournisseurs'.
    const updatedArticle = await Article.findByIdAndUpdate(
        articleId,
        { $pull: { fournisseurs: { _id: fournisseurInfoId } } },
        { new: true } // 'new: true' assure que le document retourné est la version mise à jour.
    );

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
 * @param {number} [req.body.delaiIndicatifApprovisionnement] - Nouveau délai indicatif d'approvisionnement en jours
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
    const { prixUnitaire, referenceFournisseur, uniteConditionnement, quantiteParConditionnement, delaiIndicatifApprovisionnement } = req.body;

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
    if (delaiIndicatifApprovisionnement !== undefined) fournisseurInfo.delaiIndicatifApprovisionnement = delaiIndicatifApprovisionnement;

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

/**
 * Uploader une image pour un fournisseur d'article spécifique.
 * @function uploadFournisseurImage
 * @memberof module:controllers/articleController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de l'article
 * @param {string} req.params.fournisseurId - ID du fournisseur
 * @param {Object} req.file - Fichier uploadé (ajouté par le middleware multer)
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie l'URL de l'image uploadée
 * @throws {NotFoundError} Si l'article ou le fournisseur n'est pas trouvé
 * @throws {BadRequestError} Si aucun fichier n'est fourni
 * @since 1.0.0
 */
exports.uploadFournisseurImage = async (req, res, next) => {
    try {
        const { id: articleId, fournisseurId } = req.params;
        
        // Vérifier si un fichier a été uploadé
        if (!req.file) {
            return next(new BadRequestError('Aucun fichier image fourni'));
        }
        
        // Rechercher l'article
        const article = await Article.findById(articleId);
        if (!article) {
            return next(new NotFoundError('Article non trouvé'));
        }
        
        // Trouver le lien fournisseur
        const supplierLink = article.fournisseurs.find(f => f._id.toString() === fournisseurId);
        if (!supplierLink) {
            return next(new NotFoundError('Lien fournisseur non trouvé'));
        }
        
        // Si une image existe déjà, la supprimer
        if (supplierLink.imageUrl) {
            // Extract the object path from the URL (e.g., "article-images/filename.png")
            const urlParts = supplierLink.imageUrl.split(`/${bucketName}/`);
            if (urlParts.length > 1) {
                const objectName = urlParts[1];
                try {
                    await minioClient.removeObject(bucketName, objectName);
                } catch (error) {
                    console.warn('Erreur lors de la suppression de l\'ancienne image:', error);
                }
            }
        }
        
        // Créer un nom de fichier unique
        const fileExtension = path.extname(req.file.originalname);
        const fileName = `article-${articleId}-supplier-${fournisseurId}-${Date.now()}${fileExtension}`;
        const objectName = `article-images/${fileName}`;
        
        // Uploader vers MinIO
        await minioClient.putObject(bucketName, objectName, req.file.buffer, req.file.size);
        
        // Construire l'URL de l'image
        const imageUrl = `${config.minio.useSSL ? 'https' : 'http'}://${config.minio.externalHost}:${config.minio.port}/${bucketName}/${objectName}`;
        
        // Mettre à jour l'article avec l'URL de l'image
        supplierLink.imageUrl = imageUrl;
        await article.save();
        
        res.json({
            message: 'Image uploadée avec succès',
            imageUrl: imageUrl
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * Supprimer l'image d'un fournisseur d'article spécifique.
 * @function deleteFournisseurImage
 * @memberof module:controllers/articleController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de l'article
 * @param {string} req.params.fournisseurId - ID du fournisseur
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Confirmation de la suppression
 * @throws {NotFoundError} Si l'article ou le fournisseur n'est pas trouvé
 * @since 1.0.0
 */
exports.deleteFournisseurImage = async (req, res, next) => {
    try {
        const { id: articleId, fournisseurId } = req.params;
        
        // Rechercher l'article
        const article = await Article.findById(articleId);
        if (!article) {
            return next(new NotFoundError('Article non trouvé'));
        }
        
        // Trouver le lien fournisseur
        const supplierLink = article.fournisseurs.find(f => f._id.toString() === fournisseurId);
        if (!supplierLink) {
            return next(new NotFoundError('Lien fournisseur non trouvé'));
        }
        
        // Vérifier si une image existe
        if (!supplierLink.imageUrl) {
            return next(new NotFoundError('Aucune image trouvée pour ce fournisseur'));
        }
        
        // Extract the object path from the URL (e.g., "article-images/filename.png")
        const urlParts = supplierLink.imageUrl.split(`/${bucketName}/`);
        if (urlParts.length > 1) {
            const objectName = urlParts[1];
            try {
                await minioClient.removeObject(bucketName, objectName);
            } catch (error) {
                console.warn('Erreur lors de la suppression de l\'image:', error);
            }
        }
        
        // Mettre à jour l'article
        supplierLink.imageUrl = null;
        await article.save();
        
        res.json({
            message: 'Image supprimée avec succès'
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * Get articles by supplier ID with pagination support
 * @function getArticlesBySupplierId
 * @memberof module:controllers/articleController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.supplierId - ID du fournisseur
 * @param {Object} req.pagination - Paramètres de pagination
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la liste des articles actifs liés à ce fournisseur
 * @since 1.0.0
 */
exports.getArticlesBySupplierId = async (req, res, next) => {
    try {
        const { supplierId } = req.params;
        const { page, limit, skip, search, sortBy, sortOrder, filters } = req.pagination;
        
        // Build base query - show only active articles by default for suppliers
        let query = {
            'fournisseurs.fournisseurId': supplierId
        };
        
        // Apply status filter - default to active for this endpoint
        if (!filters.status || filters.status === 'active') {
            query.isActive = true;
        } else if (filters.status === 'inactive') {
            query.isActive = false;
        }
        
        // Apply search across relevant fields
        if (search) {
            query.$or = [
                { codeArticle: { $regex: search, $options: 'i' } },
                { designation: { $regex: search, $options: 'i' } },
                { categorie: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Apply category filter if provided
        if (filters.categorie) {
            query.categorie = filters.categorie;
        }
        
        // Find articles with pagination
        const articles = await Article.find(query)
            .select('codeArticle designation categorie isActive fournisseurs')
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);
        
        // Get total count for pagination
        const totalCount = await Article.countDocuments(query);
        
        // Filter to only include supplier info for the requested supplier
        const filteredArticles = articles.map(article => {
            const articleObj = article.toObject();
            articleObj.fournisseurs = articleObj.fournisseurs.filter(f => 
                f.fournisseurId.toString() === supplierId
            );
            return articleObj;
        });
        
        // Use standard pagination response format
        res.json(req.pagination.buildResponse(filteredArticles, totalCount));
        
    } catch (error) {
        next(error);
    }
};
