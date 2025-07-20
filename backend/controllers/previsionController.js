/**
 * @fileoverview Contrôleur pour la gestion des prévisions de consommation d'articles
 * @module controllers/previsionController
 * @requires models/previsionModel
 * @requires models/fournisseurModel
 * @requires utils/appError
 * @author Gestion Emballages Team
 * @since 1.0.0
 */

// backend/controllers/previsionController.js
const Prevision = require('../models/previsionModel');
const Fournisseur = require('../models/fournisseurModel');
const Article = require('../models/articleModel');
const { NotFoundError, ForbiddenError } = require('../utils/appError');

/**
 * Créer une nouvelle prévision pour un fournisseur et un site spécifique.
 * @function createPrevision
 * @memberof module:controllers/previsionController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.campagne - Nom de la campagne au format "AA-AA" (ex: "25-26")
 * @param {string} req.body.fournisseurId - ID du fournisseur
 * @param {string} req.body.siteId - ID du site du fournisseur
 * @param {Object} req.user - Utilisateur connecté (ajouté par le middleware auth)
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la prévision créée vide
 * @since 1.0.0
 * @example
 * // POST /api/previsions
 * // Body: { "campagne": "25-26", "fournisseurId": "64f5a1b2c3d4e5f6a7b8c9d0", "siteId": "64f5a1b2c3d4e5f6a7b8c9d1" }
 * // Response: { "_id": "...", "campagne": "25-26", "fournisseurId": {...}, "siteId": "...", "articlesPrevisions": [] }
 */
exports.createPrevision = async (req, res, next) => {
    try {
        const { campagne, fournisseurId, siteId } = req.body;
        
        // Vérifier que le fournisseur existe
        const fournisseur = await Fournisseur.findById(fournisseurId);
        if (!fournisseur) {
            return next(new NotFoundError('Fournisseur non trouvé'));
        }

        // Vérifier que le site existe et appartient au fournisseur
        const site = fournisseur.sites.id(siteId);
        if (!site || !site.isActive) {
            return next(new NotFoundError('Site non trouvé ou inactif'));
        }
        
        // Créer la prévision vide (les articles seront ajoutés séparément)
        const prevision = await Prevision.create({
            campagne,
            fournisseurId,
            siteId,
            articlesPrevisions: []
        });

        // Populer les références pour la réponse
        const previsionPopulated = await Prevision.findById(prevision._id)
            .populate('fournisseurId', 'nom sites');

        res.status(201).json(previsionPopulated);
    } catch (error) {
        next(error);
    }
};

/**
 * Ajouter une prévision d'article à une prévision existante.
 * @function addArticlePrevision
 * @memberof module:controllers/previsionController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de la prévision
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.articleId - ID de l'article
 * @param {Array<Object>} req.body.semaines - Prévisions par semaine
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la prévision mise à jour
 * @since 1.0.0
 */
exports.addArticlePrevision = async (req, res, next) => {
    try {
        const { articleId, semaines } = req.body;
        const prevision = await Prevision.findById(req.params.id);

        if (!prevision) {
            return next(new NotFoundError('Prévision non trouvée'));
        }

        // Vérifier si l'article existe déjà
        const existingArticle = prevision.articlesPrevisions.find(
            ap => ap.articleId.toString() === articleId
        );

        if (existingArticle) {
            return next(new Error('Cet article existe déjà dans cette prévision'));
        }

        // Ajouter la nouvelle prévision d'article
        prevision.articlesPrevisions.push({
            articleId,
            semaines: semaines || []
        });

        const updatedPrevision = await prevision.save();
        
        // Populer les références pour la réponse
        const previsionPopulated = await Prevision.findById(updatedPrevision._id)
            .populate('fournisseurId', 'nom sites')
            .populate('articlesPrevisions.articleId', 'designation codeArticle fournisseurs');

        res.json(previsionPopulated);
    } catch (error) {
        next(error);
    }
};

/**
 * Mettre à jour les quantités d'une prévision d'article.
 * @function updateArticlePrevision
 * @memberof module:controllers/previsionController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de la prévision
 * @param {string} req.params.articlePrevisionId - ID de la prévision d'article
 * @param {Object} req.body - Corps de la requête
 * @param {Array<Object>} req.body.semaines - Nouvelles prévisions par semaine
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la prévision mise à jour
 * @since 1.0.0
 */
exports.updateArticlePrevision = async (req, res, next) => {
    try {
        const { semaines } = req.body;
        const prevision = await Prevision.findById(req.params.id);

        if (!prevision) {
            return next(new NotFoundError('Prévision non trouvée'));
        }

        const articlePrevision = prevision.articlesPrevisions.id(req.params.articlePrevisionId);
        if (!articlePrevision) {
            return next(new NotFoundError('Prévision d\'article non trouvée'));
        }

        // Mettre à jour les semaines
        articlePrevision.semaines = semaines;

        const updatedPrevision = await prevision.save();
        
        // Populer les références pour la réponse
        const previsionPopulated = await Prevision.findById(updatedPrevision._id)
            .populate('fournisseurId', 'nom sites')
            .populate('articlesPrevisions.articleId', 'designation codeArticle fournisseurs');

        res.json(previsionPopulated);
    } catch (error) {
        next(error);
    }
};

/**
 * Récupérer les prévisions consolidées pour un fournisseur et une campagne
 * @function getSupplierPrevisions
 * @memberof module:controllers/previsionController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.fournisseurId - ID du fournisseur
 * @param {string} req.params.campagne - Campagne
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie toutes les prévisions du fournisseur pour la campagne
 * @since 1.0.0
 */
exports.getSupplierPrevisions = async (req, res, next) => {
    try {
        const { fournisseurId, campagne } = req.params;
        
        let query = {
            fournisseurId: fournisseurId,
            campagne: campagne
        };
        
        // Contrôle d'accès basé sur le rôle
        if (req.user.role === 'Fournisseur' && req.user.entiteId.toString() !== fournisseurId) {
            return next(new ForbiddenError('Accès non autorisé à ces prévisions'));
        }
        
        const previsions = await Prevision.find(query)
            .populate('fournisseurId', 'nom sites')
            .populate('articlesPrevisions.articleId', 'designation codeArticle categorie fournisseurs')
            .sort({ siteId: 1 });
        
        res.json({ data: previsions });
    } catch (error) {
        next(error);
    }
};

/**
 * Récupérer toutes les prévisions avec pagination et filtrage
 * @function getPrevisions
 * @memberof module:controllers/previsionController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.pagination - Paramètres de pagination (ajoutés par le middleware)
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la liste paginée des prévisions
 * @since 1.0.0
 */
exports.getPrevisions = async (req, res, next) => {
    try {
        const { page, limit, skip, search, sortBy, sortOrder, filters } = req.pagination;
        
        let query = {};
        
        // Filtre par campagne
        if (filters.campagne) {
            query.campagne = filters.campagne;
        }
        
        // Filtre par fournisseur
        if (filters.fournisseurId) {
            query.fournisseurId = filters.fournisseurId;
        }
        
        // Filtre par article
        if (filters.articleId) {
            query.articleId = filters.articleId;
        }
        
        // Contrôle d'accès basé sur le rôle
        if (req.user.role === 'Fournisseur') {
            query.fournisseurId = req.user.entiteId;
        }
        
        // Recherche textuelle avancée
        if (search) {
            // Construire la requête de recherche - commencer par la campagne
            const searchConditions = [
                { campagne: { $regex: search, $options: 'i' } }
            ];
            
            try {
                // Rechercher les fournisseurs par nom
                const fournisseursByName = await Fournisseur.find({
                    nom: { $regex: search, $options: 'i' }
                }).distinct('_id');
                
                // Rechercher les fournisseurs et sites par nom de site
                const fournisseursWithSites = await Fournisseur.find({
                    'sites.nomSite': { $regex: search, $options: 'i' }
                });
                
                // Ajouter les conditions de recherche par nom de fournisseur
                if (fournisseursByName.length > 0) {
                    searchConditions.push({ fournisseurId: { $in: fournisseursByName } });
                }
                
                // Ajouter les conditions de recherche par site spécifique
                if (fournisseursWithSites.length > 0) {
                    const siteConditions = [];
                    fournisseursWithSites.forEach(fournisseur => {
                        const matchingSites = fournisseur.sites.filter(site => 
                            site.nomSite.match(new RegExp(search, 'i'))
                        );
                        matchingSites.forEach(site => {
                            siteConditions.push({
                                fournisseurId: fournisseur._id,
                                siteId: site._id
                            });
                        });
                    });
                    
                    if (siteConditions.length > 0) {
                        searchConditions.push({ $or: siteConditions });
                    }
                }
                
                // Rechercher les articles correspondants
                const articleIds = await Article.find({
                    designation: { $regex: search, $options: 'i' }
                }).distinct('_id');
                
                // Ajouter les conditions de recherche par article
                if (articleIds.length > 0) {
                    searchConditions.push({ 'articlesPrevisions.articleId': { $in: articleIds } });
                }
                
            } catch (searchError) {
                console.error('Error during search preparation:', searchError);
            }
            
            query.$or = searchConditions;
        }
        
        const previsions = await Prevision.find(query)
            .populate('fournisseurId', 'nom sites')
            .populate('articlesPrevisions.articleId', 'designation codeArticle fournisseurs')
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);
        
        const totalCount = await Prevision.countDocuments(query);
        
        res.json(req.pagination.buildResponse(previsions, totalCount));
    } catch (error) {
        next(error);
    }
};

/**
 * Récupérer une prévision spécifique par son ID
 * @function getPrevisionById
 * @memberof module:controllers/previsionController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de la prévision
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la prévision avec toutes ses données
 * @throws {NotFoundError} Si la prévision n'est pas trouvée
 * @throws {ForbiddenError} Si l'utilisateur n'a pas les droits d'accès
 * @since 1.0.0
 */
exports.getPrevisionById = async (req, res, next) => {
    try {
        const prevision = await Prevision.findById(req.params.id)
            .populate('fournisseurId', 'nom sites')
            .populate('articlesPrevisions.articleId', 'designation codeArticle categorie fournisseurs');
        
        if (!prevision) {
            return next(new NotFoundError('Prévision non trouvée'));
        }
        
        // Contrôle d'accès basé sur le rôle
        if (req.user.role === 'Fournisseur' && 
            prevision.fournisseurId._id.toString() !== req.user.entiteId.toString()) {
            return next(new ForbiddenError('Accès non autorisé à cette prévision'));
        }
        
        res.json(prevision);
    } catch (error) {
        next(error);
    }
};

/**
 * Supprimer une prévision
 * @function deletePrevision
 * @memberof module:controllers/previsionController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de la prévision à supprimer
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie un message de confirmation
 * @throws {NotFoundError} Si la prévision n'est pas trouvée
 * @since 1.0.0
 */
exports.deletePrevision = async (req, res, next) => {
    try {
        const prevision = await Prevision.findById(req.params.id);
        
        if (!prevision) {
            return next(new NotFoundError('Prévision non trouvée'));
        }
        
        // Supprimer définitivement
        await Prevision.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Prévision supprimée avec succès' });
    } catch (error) {
        next(error);
    }
};

/**
 * Supprimer une prévision d'article d'une prévision
 * @function removeArticlePrevision
 * @memberof module:controllers/previsionController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de la prévision
 * @param {string} req.params.articlePrevisionId - ID de la prévision d'article
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la prévision mise à jour
 * @since 1.0.0
 */
exports.removeArticlePrevision = async (req, res, next) => {
    try {
        const prevision = await Prevision.findById(req.params.id);
        
        if (!prevision) {
            return next(new NotFoundError('Prévision non trouvée'));
        }
        
        // Supprimer la prévision d'article
        prevision.articlesPrevisions.pull(req.params.articlePrevisionId);
        
        const updatedPrevision = await prevision.save();
        
        // Populer les références pour la réponse
        const previsionPopulated = await Prevision.findById(updatedPrevision._id)
            .populate('fournisseurId', 'nom sites')
            .populate('articlesPrevisions.articleId', 'designation codeArticle fournisseurs');
        
        res.json(previsionPopulated);
    } catch (error) {
        next(error);
    }
};

