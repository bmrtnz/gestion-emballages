/**
 * @fileoverview Contrôleur pour la gestion des stocks des fournisseurs
 * @module controllers/stockFournisseurController
 * @requires models/stockFournisseurModel
 * @requires models/fournisseurModel
 * @requires utils/appError
 */

const mongoose = require('mongoose');
const StockFournisseur = require('../models/stockFournisseurModel');
const Fournisseur = require('../models/fournisseurModel');
const { BadRequestError, ForbiddenError, NotFoundError } = require('../utils/appError');

/**
 * Soumettre un inventaire de stock pour un site fournisseur
 * @function submitStock
 * @memberof module:controllers/stockFournisseurController
 */
exports.submitStock = async (req, res, next) => {
    try {
        const { campagne, stocks, siteId } = req.body;
        const { role, _id: userId, entiteId } = req.user;

        // Vérification des permissions
        if (role !== 'Fournisseur' && role !== 'Gestionnaire') {
            return next(new ForbiddenError('Rôle non autorisé pour cette action.'));
        }

        if (!campagne) {
            return next(new BadRequestError('Veuillez fournir une campagne.'));
        }

        if (!siteId) {
            return next(new BadRequestError('Veuillez spécifier le site du fournisseur.'));
        }

        // Pour un fournisseur, vérifier qu'il a accès au site
        let fournisseurId = entiteId;
        if (role === 'Fournisseur') {
            const fournisseur = await Fournisseur.findById(entiteId);
            const siteExists = fournisseur.sites.some(s => s._id.toString() === siteId);
            if (!siteExists) {
                return next(new ForbiddenError('Accès au site non autorisé.'));
            }
        } else if (role === 'Gestionnaire' && req.body.fournisseurId) {
            // Un gestionnaire peut soumettre pour n'importe quel fournisseur
            fournisseurId = req.body.fournisseurId;
        }

        // Chercher ou créer le document de stock pour ce fournisseur/site/campagne
        let stockFournisseur = await StockFournisseur.findOne({
            fournisseurId,
            siteId,
            campagne
        });

        if (!stockFournisseur) {
            // Créer un nouveau document de stock
            stockFournisseur = new StockFournisseur({
                campagne,
                fournisseurId,
                siteId,
                weeklyStocks: []
            });
            await stockFournisseur.save();
        } else {
            // For initial stock creation, we can just save the document
            // Individual weekly updates will be handled by the weekly update endpoints
        }

        res.status(201).json({ 
            message: 'Stock du fournisseur enregistré avec succès.',
            stockId: stockFournisseur._id
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Obtenir le stock d'un fournisseur pour un site spécifique
 * @function getSiteStock
 * @memberof module:controllers/stockFournisseurController
 */
exports.getSiteStock = async (req, res, next) => {
    try {
        const { fournisseurId, siteId } = req.params;
        const { role, entiteId } = req.user;

        // Vérifier les permissions d'accès
        if (role === 'Fournisseur' && entiteId.toString() !== fournisseurId) {
            return next(new ForbiddenError('Accès non autorisé à ce stock.'));
        }

        const stockFournisseur = await StockFournisseur.findOne({
            fournisseurId,
            siteId
        })
        .populate('fournisseurId', 'nom')
        .populate('articles.articleId', 'codeArticle designation conditionnement')
        .populate('articles.modifieParId', 'nom prenom email')
        .populate('derniereModificationParId', 'nom prenom email');

        if (!stockFournisseur) {
            return res.status(200).json({
                fournisseur: { _id: fournisseurId },
                site: { _id: siteId },
                articles: [],
                message: 'Aucun stock enregistré pour ce site.'
            });
        }

        // Obtenir les informations du site depuis le fournisseur
        const fournisseur = await Fournisseur.findById(fournisseurId);
        const site = fournisseur.sites.find(s => s._id.toString() === siteId);

        res.status(200).json({
            _id: stockFournisseur._id,
            fournisseur: {
                _id: stockFournisseur.fournisseurId._id,
                nom: stockFournisseur.fournisseurId.nom
            },
            site: {
                _id: site._id,
                nomSite: site.nomSite
            },
            articles: stockFournisseur.articles,
            derniereModificationLe: stockFournisseur.derniereModificationLe,
            derniereModificationParId: stockFournisseur.derniereModificationParId,
            createdAt: stockFournisseur.createdAt,
            updatedAt: stockFournisseur.updatedAt
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtenir tous les stocks d'un fournisseur (tous les sites)
 * @function getAllSiteStocks
 * @memberof module:controllers/stockFournisseurController
 */
exports.getAllSiteStocks = async (req, res, next) => {
    try {
        const { fournisseurId } = req.params;
        const { role, entiteId } = req.user;

        // Vérifier les permissions d'accès
        if (role === 'Fournisseur' && entiteId !== fournisseurId) {
            return next(new ForbiddenError('Accès non autorisé à ces stocks.'));
        }

        const stocks = await StockFournisseur.find({ fournisseurId })
            .populate('fournisseurId', 'nom')
            .populate('articles.articleId', 'codeArticle designation conditionnement')
            .populate('articles.modifieParId', 'nom prenom email')
            .populate('derniereModificationParId', 'nom prenom email');

        // Obtenir les informations des sites
        const fournisseur = await Fournisseur.findById(fournisseurId).populate('sites');
        
        const stocksWithSiteInfo = stocks.map(stock => {
            const site = fournisseur.sites.find(s => s._id.toString() === stock.siteId.toString());
            return {
                _id: stock._id,
                fournisseur: {
                    _id: stock.fournisseurId._id,
                    nom: stock.fournisseurId.nom
                },
                site: {
                    _id: site._id,
                    nomSite: site.nomSite
                },
                nombreArticles: stock.articles.length,
                totalQuantite: stock.articles.reduce((sum, article) => sum + article.quantite, 0),
                derniereModificationLe: stock.derniereModificationLe,
                derniereModificationParId: stock.derniereModificationParId,
                createdAt: stock.createdAt
            };
        });

        res.status(200).json(stocksWithSiteInfo);
    } catch (error) {
        next(error);
    }
};

/**
 * Mettre à jour le stock d'un article spécifique
 * @function updateArticleStock
 * @memberof module:controllers/stockFournisseurController
 */
exports.updateArticleStock = async (req, res, next) => {
    try {
        const { fournisseurId, siteId, articleId } = req.params;
        const { quantite } = req.body;
        const { role, entiteId, _id: userId } = req.user;

        // Vérifier les permissions
        if (role === 'Fournisseur' && entiteId !== fournisseurId) {
            return next(new ForbiddenError('Accès non autorisé pour modifier ce stock.'));
        }

        if (quantite === undefined || quantite < 0) {
            return next(new BadRequestError('La quantité doit être un nombre positif.'));
        }

        let stockFournisseur = await StockFournisseur.findOne({
            fournisseurId,
            siteId,
            campagne
        });

        if (!stockFournisseur) {
            // Créer un nouveau document de stock si nécessaire
            stockFournisseur = new StockFournisseur({
                campagne,
                fournisseurId,
                siteId,
                articles: [],
                derniereModificationParId: userId,
                derniereModificationLe: new Date()
            });
        }

        await stockFournisseur.updateArticleStock(articleId, quantite, userId);

        // Recharger avec les populations
        stockFournisseur = await StockFournisseur.findById(stockFournisseur._id)
            .populate('articles.articleId', 'codeArticle designation')
            .populate('articles.modifieParId', 'nom prenom email');

        const updatedArticle = stockFournisseur.articles.find(
            a => a.articleId._id.toString() === articleId
        );

        res.status(200).json({
            message: 'Stock mis à jour avec succès.',
            article: updatedArticle
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Supprimer un article du stock
 * @function deleteArticleFromStock
 * @memberof module:controllers/stockFournisseurController
 */
exports.deleteArticleFromStock = async (req, res, next) => {
    try {
        const { fournisseurId, siteId, articleId } = req.params;
        const { role, entiteId } = req.user;

        // Vérifier les permissions
        if (role === 'Fournisseur' && entiteId !== fournisseurId) {
            return next(new ForbiddenError('Accès non autorisé pour modifier ce stock.'));
        }

        const stockFournisseur = await StockFournisseur.findOne({
            fournisseurId,
            siteId
        });

        if (!stockFournisseur) {
            return next(new NotFoundError('Stock non trouvé.'));
        }

        // Supprimer l'article
        stockFournisseur.articles = stockFournisseur.articles.filter(
            article => article.articleId.toString() !== articleId
        );

        stockFournisseur.derniereModificationLe = new Date();
        stockFournisseur.derniereModificationParId = req.user._id;
        
        await stockFournisseur.save();

        res.status(200).json({
            message: 'Article supprimé du stock avec succès.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Enregistrer le stock hebdomadaire pour une campagne
 * @function updateWeeklyStock
 * @memberof module:controllers/stockFournisseurController
 */
exports.updateWeeklyStock = async (req, res, next) => {
    try {
        const { fournisseurId, siteId, articleId } = req.params;
        const { campagne, numeroSemaine, quantite } = req.body;
        const { role, entiteId, _id: userId } = req.user;

        // Vérifier les permissions
        if (role === 'Fournisseur' && entiteId !== fournisseurId) {
            return next(new ForbiddenError('Accès non autorisé pour modifier ce stock.'));
        }

        // Validation des données
        if (!campagne || !campagne.match(/^\d{2}-\d{2}$/)) {
            return next(new BadRequestError('Format de campagne invalide (format attendu: "25-26").'));
        }

        if (!numeroSemaine || numeroSemaine < 1 || numeroSemaine > 52) {
            return next(new BadRequestError('Numéro de semaine invalide (1-52).'));
        }

        if (quantite === undefined || quantite < 0) {
            return next(new BadRequestError('La quantité doit être un nombre positif.'));
        }

        let stockFournisseur = await StockFournisseur.findOne({
            fournisseurId,
            siteId,
            campagne
        });

        if (!stockFournisseur) {
            // Créer un nouveau document de stock si nécessaire
            stockFournisseur = new StockFournisseur({
                campagne,
                fournisseurId,
                siteId,
                weeklyStocks: []
            });
            // Save the new document before calling updateArticleWeeklyStock
            await stockFournisseur.save();
        }

        await stockFournisseur.updateArticleWeeklyStock(numeroSemaine, articleId, quantite);

        res.status(200).json({
            message: 'Stock hebdomadaire mis à jour avec succès.',
            campagne,
            numeroSemaine,
            quantite
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Mettre à jour le stock complet d'une semaine (tous les articles)
 * @function updateCompleteWeeklyStock
 * @memberof module:controllers/stockFournisseurController
 */
exports.updateCompleteWeeklyStock = async (req, res, next) => {
    try {
        const { fournisseurId, siteId } = req.params;
        const { campagne, numeroSemaine, articles } = req.body;
        const { role, entiteId } = req.user;

        // Vérifier les permissions
        if (role === 'Fournisseur' && entiteId.toString() !== fournisseurId) {
            return next(new ForbiddenError('Accès non autorisé pour modifier ce stock.'));
        }

        // Validation des données
        if (!campagne || !campagne.match(/^\d{2}-\d{2}$/)) {
            return next(new BadRequestError('Format de campagne invalide (format attendu: "25-26").'));
        }

        if (!numeroSemaine || numeroSemaine < 1 || numeroSemaine > 52) {
            return next(new BadRequestError('Numéro de semaine invalide (1-52).'));
        }

        if (!articles || !Array.isArray(articles)) {
            return next(new BadRequestError('La liste des articles doit être un tableau.'));
        }

        // Valider les articles
        for (const article of articles) {
            if (!article.articleId) {
                return next(new BadRequestError('Chaque article doit avoir un articleId.'));
            }
            if (article.quantiteStock === undefined || article.quantiteStock < 0) {
                return next(new BadRequestError('Chaque article doit avoir une quantité positive.'));
            }
        }

        // Log incoming data for debugging
        console.log(`[Controller] updateCompleteWeeklyStock called with:`, {
            fournisseurId,
            siteId,
            campagne,
            numeroSemaine,
            articlesCount: articles.length
        });

        // Try to find and update in one atomic operation
        let stockFournisseur = await StockFournisseur.findOneAndUpdate(
            {
                fournisseurId,
                siteId,
                campagne
            },
            {
                $setOnInsert: {
                    campagne,
                    fournisseurId,
                    siteId,
                    weeklyStocks: []
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        console.log(`[Controller] Document found/created:`, {
            _id: stockFournisseur._id,
            isNew: stockFournisseur.isNew,
            weeklyStocksCount: stockFournisseur.weeklyStocks.length
        });

        // Alternative approach: Use atomic operators for more reliable updates
        // First, remove existing week data if it exists
        await StockFournisseur.updateOne(
            {
                _id: stockFournisseur._id,
                'weeklyStocks.numeroSemaine': numeroSemaine
            },
            {
                $pull: { weeklyStocks: { numeroSemaine } }
            }
        );

        // Then add the new week data with all articles
        await StockFournisseur.updateOne(
            { _id: stockFournisseur._id },
            {
                $push: {
                    weeklyStocks: {
                        $each: [{
                            numeroSemaine,
                            articles: articles.map(article => ({
                                articleId: article.articleId,
                                quantiteStock: article.quantiteStock || 0
                            }))
                        }],
                        $sort: { numeroSemaine: 1 }
                    }
                }
            }
        );
        
        console.log(`[Controller] Update completed successfully using atomic operators`);

        res.status(200).json({
            message: 'Stock hebdomadaire complet mis à jour avec succès.',
            campagne,
            numeroSemaine,
            articlesCount: articles.length
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtenir l'historique de stock d'un article pour une campagne
 * @function getArticleCampaignHistory
 * @memberof module:controllers/stockFournisseurController
 */
exports.getArticleCampaignHistory = async (req, res, next) => {
    try {
        const { fournisseurId, siteId, articleId, campagne } = req.params;
        const { role, entiteId } = req.user;

        // Vérifier les permissions d'accès
        if (role === 'Fournisseur' && entiteId !== fournisseurId) {
            return next(new ForbiddenError('Accès non autorisé à cet historique.'));
        }

        const stockFournisseur = await StockFournisseur.findOne({
            fournisseurId,
            siteId,
            campagne
        })
        .populate('articles.articleId', 'codeArticle designation')
        .populate('articles.semaines.modifieParId', 'nom prenom email');

        if (!stockFournisseur) {
            return res.status(200).json({
                message: 'Aucun stock trouvé pour ce site.',
                historique: null
            });
        }

        const historique = stockFournisseur.getArticleHistory(articleId);
        
        if (!historique || historique.length === 0) {
            return res.status(200).json({
                message: 'Aucun historique trouvé pour cet article.',
                historique: []
            });
        }

        // Peupler l'article pour obtenir ses détails
        await stockFournisseur.populate('weeklyStocks.articles.articleId', 'codeArticle designation');
        
        // Trouver les détails de l'article
        let articleDetails = null;
        for (const weekStock of stockFournisseur.weeklyStocks) {
            const article = weekStock.articles.find(a => a.articleId._id.toString() === articleId);
            if (article) {
                articleDetails = article.articleId;
                break;
            }
        }

        res.status(200).json({
            article: articleDetails ? {
                _id: articleDetails._id,
                codeArticle: articleDetails.codeArticle,
                designation: articleDetails.designation
            } : null,
            campagne,
            historique: historique,
            totalQuantite: stockFournisseur.getArticleTotalStock(articleId),
            statistiquesParTrimestre: stockFournisseur.getQuarterlyStats()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtenir le stock d'une semaine spécifique
 * @function getWeeklyStock
 * @memberof module:controllers/stockFournisseurController
 */
exports.getWeeklyStock = async (req, res, next) => {
    try {
        const { fournisseurId, siteId, numeroSemaine } = req.params;
        const { campagne } = req.query;
        const { role, entiteId } = req.user;

        // Vérifier les permissions d'accès
        if (role === 'Fournisseur' && entiteId.toString() !== fournisseurId) {
            return next(new ForbiddenError('Accès non autorisé à ce stock.'));
        }

        if (!campagne || !campagne.match(/^\d{2}-\d{2}$/)) {
            return next(new BadRequestError('Format de campagne invalide (format attendu: "25-26").'));
        }

        const stockFournisseur = await StockFournisseur.findOne({
            fournisseurId,
            siteId,
            campagne
        }).populate('weeklyStocks.articles.articleId', 'codeArticle designation conditionnement');

        if (!stockFournisseur) {
            return res.status(200).json({
                message: 'Aucun stock trouvé pour ce site et cette campagne.',
                weeklyStock: []
            });
        }

        const weeklyStock = stockFournisseur.getWeeklyStock(parseInt(numeroSemaine));

        res.status(200).json({
            campagne,
            fournisseurId,
            siteId,
            numeroSemaine: parseInt(numeroSemaine),
            articles: weeklyStock
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtenir les statistiques de stock pour une campagne
 * @function getCampaignStockStats
 * @memberof module:controllers/stockFournisseurController
 */
exports.getCampaignStockStats = async (req, res, next) => {
    try {
        const { fournisseurId, siteId, campagne } = req.params;
        const { role, entiteId } = req.user;

        // Vérifier les permissions d'accès
        if (role === 'Fournisseur' && entiteId !== fournisseurId) {
            return next(new ForbiddenError('Accès non autorisé à ces statistiques.'));
        }

        const stockFournisseur = await StockFournisseur.findOne({
            fournisseurId,
            siteId
        })
        .populate('articles.articleId', 'codeArticle designation conditionnement')
        .populate('fournisseurId', 'nom');

        if (!stockFournisseur) {
            return res.status(200).json({
                message: 'Aucun stock trouvé pour ce site.',
                statistiques: []
            });
        }

        // Obtenir les informations du site
        const fournisseur = await Fournisseur.findById(fournisseurId);
        const site = fournisseur.sites.find(s => s._id.toString() === siteId);

        // Calculer les statistiques pour chaque article
        const statistiques = stockFournisseur.articles.map(article => {
            const historique = stockFournisseur.getArticleCampaignHistory(article.articleId._id, campagne);
            
            return {
                article: {
                    _id: article.articleId._id,
                    codeArticle: article.articleId.codeArticle,
                    designation: article.articleId.designation,
                    conditionnement: article.articleId.conditionnement
                },
                stockActuel: article.quantite,
                historiqueDisponible: !!historique,
                totalCampagne: historique ? stockFournisseur.getTotalStockCampagne(article.articleId._id, campagne) : 0,
                statistiquesParTrimestre: historique ? stockFournisseur.getStockStatsByQuarter(article.articleId._id, campagne) : null
            };
        });

        res.status(200).json({
            fournisseur: {
                _id: stockFournisseur.fournisseurId._id,
                nom: stockFournisseur.fournisseurId.nom
            },
            site: {
                _id: site._id,
                nomSite: site.nomSite
            },
            campagne,
            statistiques
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Obtenir le statut de mise à jour des stocks d'un fournisseur
 * @route   GET /api/stocks-fournisseurs/status/:fournisseurId
 * @access  Private (Gestionnaire, Fournisseur)
 */
const getSupplierStockStatus = async (req, res, next) => {
    try {
        const { fournisseurId } = req.params;
        
        // Vérification des permissions
        if (req.user.role === 'Fournisseur' && req.user.entiteId.toString() !== fournisseurId) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé - vous ne pouvez consulter que vos propres stocks'
            });
        }
        
        // Rechercher la date de mise à jour la plus récente pour ce fournisseur
        // Simple approach: get the most recently updated stock document
        const latestStock = await StockFournisseur.findOne({
            fournisseurId: new mongoose.Types.ObjectId(fournisseurId)
        })
        .sort({ updatedAt: -1 })
        .select('updatedAt campagne siteId weeklyStocks');
        
        console.log('[DEBUG] Latest stock document found:', {
            found: !!latestStock,
            updatedAt: latestStock?.updatedAt,
            campagne: latestStock?.campagne,
            weeklyStocksCount: latestStock?.weeklyStocks?.length || 0
        });
        
        let lastUpdateDate = null;
        let daysSinceUpdate = null;
        let status = 'never';
        
        if (latestStock && latestStock.updatedAt) {
            lastUpdateDate = latestStock.updatedAt;
            const now = new Date();
            const diffTime = Math.abs(now - lastUpdateDate);
            daysSinceUpdate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            console.log('[DEBUG] Date calculation:', {
                now: now.toISOString(),
                lastUpdateDate: lastUpdateDate.toISOString(),
                diffTimeMs: diffTime,
                daysSinceUpdate
            });
            
            // Déterminer le statut basé sur l'ancienneté
            if (daysSinceUpdate < 14) {
                status = 'good';
            } else if (daysSinceUpdate < 30) {
                status = 'warning';
            } else {
                status = 'critical';
            }
        }
        
        console.log('[DEBUG] Final status:', { lastUpdateDate, daysSinceUpdate, status });
        
        res.status(200).json({
            success: true,
            data: {
                lastUpdateDate,
                daysSinceUpdate,
                status
            }
        });
        
    } catch (error) {
        console.error('Erreur lors de la récupération du statut des stocks:', error);
        next(error);
    }
};

module.exports = {
    submitStock: exports.submitStock,
    getSiteStock: exports.getSiteStock,
    getAllSiteStocks: exports.getAllSiteStocks,
    updateArticleStock: exports.updateArticleStock,
    deleteArticleFromStock: exports.deleteArticleFromStock,
    updateWeeklyStock: exports.updateWeeklyStock,
    updateCompleteWeeklyStock: exports.updateCompleteWeeklyStock,
    getWeeklyStock: exports.getWeeklyStock,
    getArticleCampaignHistory: exports.getArticleCampaignHistory,
    getCampaignStockStats: exports.getCampaignStockStats,
    getSupplierStockStatus
};