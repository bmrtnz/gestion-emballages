/**
 * @fileoverview Contrôleur pour la gestion des stocks des stations
 * @module controllers/stockStationController
 * @requires models/stockStationModel
 * @requires models/stationModel
 * @requires utils/appError
 */

const StockStation = require('../models/stockStationModel');
const Station = require('../models/stationModel');
const { BadRequestError, ForbiddenError, NotFoundError } = require('../utils/appError');

/**
 * Soumettre un inventaire de stock pour une station
 * @function submitStock
 * @memberof module:controllers/stockStationController
 */
exports.submitStock = async (req, res, next) => {
    try {
        const { dateInventaire, stocks } = req.body;
        const { role, _id: creeParId, entiteId } = req.user;

        // Vérification des permissions
        if (role !== 'Station' && role !== 'Gestionnaire') {
            return next(new ForbiddenError('Rôle non autorisé pour cette action.'));
        }

        if (!dateInventaire || !stocks || stocks.length === 0) {
            return next(new BadRequestError('Veuillez fournir une date d\'inventaire et au moins un article.'));
        }

        let stationId = entiteId;
        
        // Un gestionnaire peut soumettre pour n'importe quelle station
        if (role === 'Gestionnaire' && req.body.stationId) {
            stationId = req.body.stationId;
        } else if (role === 'Station' && !entiteId) {
            return next(new BadRequestError('Utilisateur non associé à une station.'));
        }

        // Prépare les entrées de stock pour la station
        const stockEntries = stocks.map(stock => ({
            stationId,
            articleId: stock.articleId,
            quantite: stock.quantite,
            dateInventaire,
            creeParId
        }));

        // Insertion en masse des nouvelles entrées de stock
        const createdStocks = await StockStation.insertMany(stockEntries);
        
        res.status(201).json({ 
            message: 'Stock de la station enregistré avec succès.',
            stocks: createdStocks
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Obtenir le stock actuel d'une station
 * @function getStationStock
 * @memberof module:controllers/stockStationController
 */
exports.getStationStock = async (req, res, next) => {
    try {
        const { stationId } = req.params;
        const { role, entiteId } = req.user;

        // Vérifier les permissions d'accès
        if (role === 'Station' && entiteId !== stationId) {
            return next(new ForbiddenError('Accès non autorisé à ce stock.'));
        }

        // Obtenir le dernier inventaire pour chaque article
        const latestStocks = await StockStation.aggregate([
            { $match: { stationId: require('mongoose').Types.ObjectId(stationId) } },
            { $sort: { articleId: 1, dateInventaire: -1 } },
            {
                $group: {
                    _id: '$articleId',
                    quantite: { $first: '$quantite' },
                    dateInventaire: { $first: '$dateInventaire' },
                    creeParId: { $first: '$creeParId' },
                    createdAt: { $first: '$createdAt' }
                }
            }
        ]);

        // Peupler les références
        const populatedStocks = await StockStation.populate(latestStocks, [
            { path: '_id', select: 'codeArticle designation conditionnement', model: 'Article' },
            { path: 'creeParId', select: 'nom prenom email', model: 'User' }
        ]);

        // Obtenir les informations de la station
        const station = await Station.findById(stationId).select('nom');

        res.status(200).json({
            station: {
                _id: station._id,
                nom: station.nom
            },
            stocks: populatedStocks.map(stock => ({
                article: stock._id,
                quantite: stock.quantite,
                dateInventaire: stock.dateInventaire,
                creeParId: stock.creeParId,
                createdAt: stock.createdAt
            }))
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtenir l'historique du stock d'un article pour une station
 * @function getArticleStockHistory
 * @memberof module:controllers/stockStationController
 */
exports.getArticleStockHistory = async (req, res, next) => {
    try {
        const { stationId, articleId } = req.params;
        const { role, entiteId } = req.user;

        // Vérifier les permissions d'accès
        if (role === 'Station' && entiteId !== stationId) {
            return next(new ForbiddenError('Accès non autorisé à cet historique.'));
        }

        const stockHistory = await StockStation.find({
            stationId,
            articleId
        })
        .populate('articleId', 'codeArticle designation')
        .populate('creeParId', 'nom prenom email')
        .sort({ dateInventaire: -1 })
        .limit(50); // Limiter à 50 derniers inventaires

        res.status(200).json({
            article: stockHistory[0]?.articleId || { _id: articleId },
            history: stockHistory.map(stock => ({
                _id: stock._id,
                quantite: stock.quantite,
                dateInventaire: stock.dateInventaire,
                creeParId: stock.creeParId,
                createdAt: stock.createdAt
            }))
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Obtenir un résumé des stocks de toutes les stations
 * @function getAllStationsStockSummary
 * @memberof module:controllers/stockStationController
 */
exports.getAllStationsStockSummary = async (req, res, next) => {
    try {
        const { role } = req.user;

        // Seuls les gestionnaires peuvent voir tous les stocks
        if (role !== 'Gestionnaire') {
            return next(new ForbiddenError('Accès réservé aux gestionnaires.'));
        }

        // Agrégation pour obtenir le stock actuel de chaque station
        const stockSummary = await StockStation.aggregate([
            { $sort: { stationId: 1, articleId: 1, dateInventaire: -1 } },
            {
                $group: {
                    _id: {
                        stationId: '$stationId',
                        articleId: '$articleId'
                    },
                    quantite: { $first: '$quantite' },
                    dateInventaire: { $first: '$dateInventaire' }
                }
            },
            {
                $group: {
                    _id: '$_id.stationId',
                    articles: {
                        $push: {
                            articleId: '$_id.articleId',
                            quantite: '$quantite',
                            dateInventaire: '$dateInventaire'
                        }
                    },
                    totalArticles: { $sum: 1 },
                    totalQuantite: { $sum: '$quantite' }
                }
            }
        ]);

        // Peupler les références des stations
        const populatedSummary = await Station.populate(stockSummary, {
            path: '_id',
            select: 'nom'
        });

        res.status(200).json(
            populatedSummary.map(station => ({
                station: {
                    _id: station._id._id,
                    nom: station._id.nom
                },
                totalArticles: station.totalArticles,
                totalQuantite: station.totalQuantite,
                articles: station.articles
            }))
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Mettre à jour le stock d'un article pour une station
 * @function updateArticleStock
 * @memberof module:controllers/stockStationController
 */
exports.updateArticleStock = async (req, res, next) => {
    try {
        const { stationId, articleId } = req.params;
        const { quantite, dateInventaire } = req.body;
        const { role, entiteId, _id: creeParId } = req.user;

        // Vérifier les permissions
        if (role === 'Station' && entiteId !== stationId) {
            return next(new ForbiddenError('Accès non autorisé pour modifier ce stock.'));
        }

        if (quantite === undefined || quantite < 0) {
            return next(new BadRequestError('La quantité doit être un nombre positif.'));
        }

        // Créer une nouvelle entrée de stock (historique)
        const newStock = new StockStation({
            stationId,
            articleId,
            quantite,
            dateInventaire: dateInventaire || new Date(),
            creeParId
        });

        await newStock.save();

        // Peupler les références
        await newStock.populate('articleId', 'codeArticle designation');
        await newStock.populate('creeParId', 'nom prenom email');

        res.status(200).json({
            message: 'Stock mis à jour avec succès.',
            stock: newStock
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Supprimer une entrée de stock (correction d'erreur)
 * @function deleteStockEntry
 * @memberof module:controllers/stockStationController
 */
exports.deleteStockEntry = async (req, res, next) => {
    try {
        const { stockId } = req.params;
        const { role, entiteId } = req.user;

        const stock = await StockStation.findById(stockId);
        
        if (!stock) {
            return next(new NotFoundError('Entrée de stock non trouvée.'));
        }

        // Vérifier les permissions
        if (role === 'Station' && entiteId !== stock.stationId.toString()) {
            return next(new ForbiddenError('Accès non autorisé pour supprimer cette entrée.'));
        }

        // Seuls les gestionnaires ou la station propriétaire peuvent supprimer
        await StockStation.findByIdAndDelete(stockId);

        res.status(200).json({
            message: 'Entrée de stock supprimée avec succès.'
        });
    } catch (error) {
        next(error);
    }
};