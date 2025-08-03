/**
 * @fileoverview Contrôleur pour la gestion des stocks des stations
 * @module controllers/stockStationController
 * @requires models/stockStationModel
 * @requires models/stationModel
 * @requires models/articleModel
 * @requires utils/appError
 */

const mongoose = require('mongoose');
const StockStation = require('../models/stockStationModel');
const Station = require('../models/stationModel');
const Article = require('../models/articleModel');
const { BadRequestError, ForbiddenError, NotFoundError } = require('../utils/appError');

/**
 * @desc    Obtenir tous les stocks d'une station pour une campagne
 * @route   GET /api/stocks-stations/stations/:stationId/campaign/:campagne
 * @access  Private (Station, Gestionnaire, Manager)
 */
exports.getStationStocksByCampaign = async (req, res, next) => {
    try {
        const { stationId, campagne } = req.params;
        
        // Vérification des permissions
        if (req.user.role === 'Station' && req.user.entiteId.toString() !== stationId) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé'
            });
        }
        
        // Vérifier que la station existe
        const station = await Station.findById(stationId);
        if (!station) {
            return res.status(404).json({
                success: false,
                message: 'Station non trouvée'
            });
        }
        
        // Récupérer toutes les entrées de stock pour cette campagne
        const stockEntries = await StockStation.find({
            stationId,
            campagne
        }).populate('weeklyStocks.articles.articleId', 'designation codeArticle categorie');
        
        res.status(200).json({
            success: true,
            data: stockEntries
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mettre à jour le stock complet d'une semaine (tous les articles)
 * @route   PUT /api/stocks-stations/stations/:stationId/weekly
 * @access  Private (Station, Gestionnaire)
 */
exports.updateCompleteWeeklyStock = async (req, res, next) => {
    try {
        const { stationId } = req.params;
        const { campagne, numeroSemaine, articles } = req.body;
        
        
        // Vérification des permissions
        if (req.user.role === 'Station' && req.user.entiteId.toString() !== stationId) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé - vous ne pouvez modifier que vos propres stocks'
            });
        }
        
        // Validation des données
        if (!campagne || !numeroSemaine || !articles || !Array.isArray(articles)) {
            return res.status(400).json({
                success: false,
                message: 'Données manquantes: campagne, numeroSemaine et articles sont requis'
            });
        }
        
        // Utiliser findOneAndUpdate avec upsert pour éviter les problèmes de concurrence
        let stockStation = await StockStation.findOneAndUpdate(
            { stationId, campagne },
            { 
                $setOnInsert: { 
                    campagne, 
                    stationId, 
                    weeklyStocks: [] 
                } 
            },
            { 
                new: true, 
                upsert: true, 
                runValidators: true 
            }
        );
        
        
        // Utiliser la méthode du modèle pour mettre à jour les stocks
        // Inclure tous les articles avec des quantités définies (y compris 0)
        const articlesWithDefinedStock = articles.filter(a => 
            a.quantiteStock !== null && a.quantiteStock !== undefined
        );
        
        if (articlesWithDefinedStock.length > 0) {
            await stockStation.updateWeeklyStocks(numeroSemaine, articlesWithDefinedStock);
        } else {
            // Si aucun article avec stock défini, s'assurer que la semaine existe mais est vide
            stockStation.getOrCreateWeek(numeroSemaine);
            await stockStation.save();
        }
        
        
        res.status(200).json({
            success: true,
            message: 'Stock hebdomadaire mis à jour avec succès',
            data: {
                stationId,
                campagne,
                numeroSemaine,
                articlesUpdated: articlesWithDefinedStock.length
            }
        });
        
    } catch (error) {
        if (error.code === 11000) {
            // Erreur de clé dupliquée - ne devrait pas arriver avec findOneAndUpdate
            return res.status(400).json({
                success: false,
                message: 'Un stock existe déjà pour cette station et cette campagne'
            });
        }
        next(error);
    }
};

/**
 * @desc    Obtenir le stock d'une semaine spécifique
 * @route   GET /api/stocks-stations/stations/:stationId/weeks/:numeroSemaine?campagne=XX-XX
 * @access  Private (Station, Gestionnaire)
 */
exports.getWeeklyStock = async (req, res, next) => {
    try {
        const { stationId, numeroSemaine } = req.params;
        const { campagne } = req.query;
        
        
        // Vérification des permissions
        if (req.user.role === 'Station' && req.user.entiteId.toString() !== stationId) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé'
            });
        }
        
        if (!campagne) {
            return res.status(400).json({
                success: false,
                message: 'La campagne est requise'
            });
        }
        
        // Trouver le stock de la station pour la campagne
        const stockStation = await StockStation.findOne({
            stationId: new mongoose.Types.ObjectId(stationId),
            campagne
        }).populate('weeklyStocks.articles.articleId', 'codeArticle designation categorie');
        
        if (!stockStation) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }
        
        // Obtenir les stocks de la semaine spécifique
        const weeklyStock = stockStation.getWeeklyStock(parseInt(numeroSemaine));
        
        // Formater la réponse
        const formattedStock = weeklyStock.map(item => ({
            articleId: item.articleId._id,
            codeArticle: item.articleId.codeArticle,
            designation: item.articleId.designation,
            categorie: item.articleId.categorie,
            quantiteStock: item.quantiteStock
        }));
        
        res.status(200).json({
            success: true,
            data: formattedStock
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Obtenir le statut de mise à jour des stocks d'une station
 * @route   GET /api/stocks-stations/status/:stationId
 * @access  Private (Gestionnaire, Station)
 */
exports.getStationStockStatus = async (req, res, next) => {
    try {
        const { stationId } = req.params;
        
        // Vérification des permissions
        if (req.user.role === 'Station' && req.user.entiteId.toString() !== stationId) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé - vous ne pouvez consulter que vos propres stocks'
            });
        }
        
        // Rechercher la date de mise à jour la plus récente pour cette station
        const latestStock = await StockStation.findOne({
            stationId: new mongoose.Types.ObjectId(stationId)
        })
        .sort({ updatedAt: -1 })
        .select('updatedAt campagne weeklyStocks');
        
        
        let lastUpdateDate = null;
        let daysSinceUpdate = null;
        let status = 'never';
        
        if (latestStock && latestStock.updatedAt) {
            lastUpdateDate = latestStock.updatedAt;
            const now = new Date();
            const diffTime = Math.abs(now - lastUpdateDate);
            daysSinceUpdate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            
            // Déterminer le statut basé sur l'ancienneté
            if (daysSinceUpdate < 14) {
                status = 'good';
            } else if (daysSinceUpdate < 30) {
                status = 'warning';
            } else {
                status = 'critical';
            }
        }
        
        
        res.status(200).json({
            success: true,
            data: {
                lastUpdateDate,
                daysSinceUpdate,
                status
            }
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Obtenir tous les stocks d'une station
 * @route   GET /api/stocks-stations/stations/:stationId
 * @access  Private (Gestionnaire, Station)
 */
exports.getAllStationStocks = async (req, res, next) => {
    try {
        const { stationId } = req.params;
        
        // Vérification des permissions
        if (req.user.role === 'Station' && req.user.entiteId.toString() !== stationId) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé'
            });
        }
        
        const stocks = await StockStation.find({ 
            stationId: new mongoose.Types.ObjectId(stationId) 
        })
        .sort({ campagne: -1, updatedAt: -1 })
        .populate('stationId', 'nom');
        
        res.status(200).json({
            success: true,
            data: stocks
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Obtenir l'historique de stock d'un article pour une campagne
 * @route   GET /api/stocks-stations/stations/:stationId/articles/:articleId/campaigns/:campagne/history
 * @access  Private (Gestionnaire, Station)
 */
exports.getArticleCampaignHistory = async (req, res, next) => {
    try {
        const { stationId, articleId, campagne } = req.params;
        
        // Vérification des permissions
        if (req.user.role === 'Station' && req.user.entiteId.toString() !== stationId) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé'
            });
        }
        
        const stockStation = await StockStation.findOne({
            stationId: new mongoose.Types.ObjectId(stationId),
            campagne
        });
        
        if (!stockStation) {
            return res.status(200).json({
                success: true,
                data: {
                    history: [],
                    total: 0
                }
            });
        }
        
        // Obtenir l'historique de l'article
        const history = stockStation.getArticleHistory(articleId);
        const total = stockStation.getArticleTotalStock(articleId);
        
        res.status(200).json({
            success: true,
            data: {
                history,
                total,
                campagne,
                stationId
            }
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Obtenir les statistiques de stock pour une campagne
 * @route   GET /api/stocks-stations/stations/:stationId/campaigns/:campagne/stats
 * @access  Private (Gestionnaire, Station)
 */
exports.getCampaignStockStats = async (req, res, next) => {
    try {
        const { stationId, campagne } = req.params;
        
        // Vérification des permissions
        if (req.user.role === 'Station' && req.user.entiteId.toString() !== stationId) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé'
            });
        }
        
        const stockStation = await StockStation.findOne({
            stationId: new mongoose.Types.ObjectId(stationId),
            campagne
        })
        .populate('weeklyStocks.articles.articleId', 'codeArticle designation categorie');
        
        if (!stockStation) {
            return res.status(200).json({
                success: true,
                data: {
                    campagne,
                    statistics: []
                }
            });
        }
        
        // Obtenir les statistiques par trimestre
        const quarterlyStats = stockStation.getQuarterlyStats();
        
        // Obtenir la liste unique des articles
        const allArticleIds = stockStation.getAllArticles();
        
        // Récupérer les détails des articles
        const articles = await Article.find({
            _id: { $in: allArticleIds }
        }).select('codeArticle designation categorie');
        
        // Créer une map pour accès rapide
        const articlesMap = new Map();
        articles.forEach(article => {
            articlesMap.set(article._id.toString(), article);
        });
        
        // Formater les statistiques
        const statistics = allArticleIds.map(articleIdStr => {
            const article = articlesMap.get(articleIdStr);
            const history = stockStation.getArticleHistory(articleIdStr);
            const total = stockStation.getArticleTotalStock(articleIdStr);
            
            return {
                article: {
                    _id: articleIdStr,
                    codeArticle: article?.codeArticle || 'N/A',
                    designation: article?.designation || 'N/A',
                    categorie: article?.categorie || 'N/A'
                },
                totalCampagne: total,
                quarterlyTotals: {
                    Q3: quarterlyStats.Q3.articleTotals[articleIdStr] || 0,
                    Q4: quarterlyStats.Q4.articleTotals[articleIdStr] || 0,
                    Q1: quarterlyStats.Q1.articleTotals[articleIdStr] || 0,
                    Q2: quarterlyStats.Q2.articleTotals[articleIdStr] || 0
                },
                weeklyHistory: history
            };
        });
        
        res.status(200).json({
            success: true,
            data: {
                campagne,
                station: {
                    _id: stockStation.stationId,
                    nom: stockStation.stationId.nom || 'N/A'
                },
                statistics,
                weeksWithStock: stockStation.getWeeksWithStock()
            }
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Obtenir les stations ayant un article en stock
 * @route   GET /api/stocks-stations/stations-with-article
 * @access  Private (Gestionnaire, Manager)
 */
exports.getStationsWithArticle = async (req, res, next) => {
    try {
        const { campagne, search } = req.query;
        
        // Vérification des permissions
        if (!['Manager', 'Gestionnaire'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé'
            });
        }
        
        if (!campagne || !search) {
            return res.status(400).json({
                success: false,
                message: 'Paramètres campagne et search requis'
            });
        }
        
        // Rechercher d'abord les articles correspondants
        const articleQuery = {
            isActive: true,
            $or: [
                { designation: { $regex: search, $options: 'i' } },
                { codeArticle: { $regex: search, $options: 'i' } }
            ]
        };
        
        const matchingArticles = await Article.find(articleQuery).select('_id');
        const articleIds = matchingArticles.map(a => a._id);
        
        if (articleIds.length === 0) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }
        
        // Trouver tous les stocks contenant ces articles
        const stocksWithArticles = await StockStation.find({
            campagne,
            'weeklyStocks.articles.articleId': { $in: articleIds }
        }).populate('stationId', 'nom adresse.ville');
        
        // Construire la liste des stations avec leurs quantités
        const stationsMap = new Map();
        
        stocksWithArticles.forEach(stock => {
            if (!stock.stationId) return;
            
            const stationId = stock.stationId._id.toString();
            
            stock.weeklyStocks.forEach(weekStock => {
                weekStock.articles.forEach(articleStock => {
                    const articleIdStr = articleStock.articleId.toString();
                    if (articleIds.some(id => id.toString() === articleIdStr) && articleStock.quantiteStock > 0) {
                        if (!stationsMap.has(stationId)) {
                            stationsMap.set(stationId, {
                                _id: stock.stationId._id,
                                nom: stock.stationId.nom,
                                ville: stock.stationId.adresse?.ville || 'Ville non renseignée',
                                totalQuantity: 0
                            });
                        }
                        // Additionner les quantités
                        const stationData = stationsMap.get(stationId);
                        stationData.totalQuantity += articleStock.quantiteStock;
                    }
                });
            });
        });
        
        // Convertir en array et trier par quantité
        const stations = Array.from(stationsMap.values())
            .sort((a, b) => b.totalQuantity - a.totalQuantity);
        
        res.status(200).json({
            success: true,
            data: stations
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Obtenir tous les articles avec leur dernière quantité mise à jour pour une station/campagne
 * @route   GET /api/stocks-stations/stations/:stationId/campaign/:campagne/summary
 * @access  Private (Gestionnaire, Manager)
 */
exports.getStationStockSummary = async (req, res, next) => {
    try {
        const { stationId, campagne } = req.params;
        
        // Vérification des permissions
        if (!['Manager', 'Gestionnaire'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé'
            });
        }
        
        // Récupérer le document de stock pour cette station/campagne
        const stockStation = await StockStation.findOne({
            stationId: new mongoose.Types.ObjectId(stationId),
            campagne
        }).populate('weeklyStocks.articles.articleId', 'designation codeArticle categorie');
        
        if (!stockStation) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }
        
        // Construire une map de tous les articles avec leur dernière quantité
        const articlesMap = new Map();
        
        // Parcourir toutes les semaines dans l'ordre chronologique
        stockStation.weeklyStocks
            .sort((a, b) => a.numeroSemaine - b.numeroSemaine)
            .forEach(weekStock => {
                weekStock.articles.forEach(articleStock => {
                    if (articleStock.articleId) {
                        const articleId = articleStock.articleId._id.toString();
                        articlesMap.set(articleId, {
                            articleId: articleStock.articleId._id,
                            codeArticle: articleStock.articleId.codeArticle,
                            designation: articleStock.articleId.designation,
                            categorie: articleStock.articleId.categorie,
                            quantiteStock: articleStock.quantiteStock,
                            derniereMAJ: weekStock.numeroSemaine
                        });
                    }
                });
            });
        
        // Convertir la map en array
        const summary = Array.from(articlesMap.values());
        
        res.status(200).json({
            success: true,
            data: summary
        });
        
    } catch (error) {
        next(error);
    }
};

module.exports = {
    updateCompleteWeeklyStock: exports.updateCompleteWeeklyStock,
    getWeeklyStock: exports.getWeeklyStock,
    getStationStockStatus: exports.getStationStockStatus,
    getAllStationStocks: exports.getAllStationStocks,
    getArticleCampaignHistory: exports.getArticleCampaignHistory,
    getCampaignStockStats: exports.getCampaignStockStats,
    getStationStocksByCampaign: exports.getStationStocksByCampaign,
    getStationStockSummary: exports.getStationStockSummary,
    getStationsWithArticle: exports.getStationsWithArticle
};