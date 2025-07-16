/**
 * @fileoverview Contrôleur pour la gestion des stocks des stations et fournisseurs
 * @module controllers/stockController
 * @requires models/stockStationModel
 * @requires models/stockFournisseurModel
 * @requires models/fournisseurModel
 * @requires utils/appError
 * @author Gestion Emballages Team
 * @since 1.0.0
 */

// backend/controllers/stockController.js
const StockStation = require('../models/stockStationModel');
const StockFournisseur = require('../models/stockFournisseurModel');
const Fournisseur = require('../models/fournisseurModel');
// Removed asyncHandler for cleaner testing and error handling
const { BadRequestError, ForbiddenError } = require('../utils/appError');

/**
 * Soumettre un inventaire de stock pour une station ou un site fournisseur.
 * @function submitStock
 * @memberof module:controllers/stockController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.body - Corps de la requête
 * @param {Date} req.body.dateInventaire - Date de l'inventaire
 * @param {Array<Object>} req.body.stocks - Liste des articles en stock
 * @param {string} req.body.stocks[].articleId - ID de l'article
 * @param {number} req.body.stocks[].quantite - Quantité en stock
 * @param {string} [req.body.siteId] - ID du site (requis pour les fournisseurs)
 * @param {Object} req.user - Utilisateur connecté (ajouté par le middleware auth)
 * @param {string} req.user.role - Rôle de l'utilisateur (Station ou Fournisseur)
 * @param {string} req.user._id - ID de l'utilisateur
 * @param {string} req.user.entiteId - ID de l'entité (station ou fournisseur)
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie un message de confirmation d'enregistrement
 * @throws {BadRequestError} Si les données requises sont manquantes ou invalides
 * @throws {ForbiddenError} Si l'utilisateur n'a pas les permissions ou accès au site
 * @since 1.0.0
 * @example
 * // Pour une station:
 * // POST /api/stocks
 * // Body: { "dateInventaire": "2025-01-15", "stocks": [{ "articleId": "64f5a1b2c3d4e5f6a7b8c9d0", "quantite": 100 }] }
 * // Response: { "message": "Stock de la station enregistré avec succès." }
 * 
 * // Pour un fournisseur:
 * // POST /api/stocks
 * // Body: { "dateInventaire": "2025-01-15", "siteId": "64f5a1b2c3d4e5f6a7b8c9d1", "stocks": [{ "articleId": "64f5a1b2c3d4e5f6a7b8c9d0", "quantite": 200 }] }
 * // Response: { "message": "Stock du fournisseur enregistré avec succès." }
 */
exports.submitStock = async (req, res, next) => {
    try {
        const { dateInventaire, stocks, siteId } = req.body; // `siteId` est requis pour les fournisseurs.
        const { role, _id: creeParId, entiteId } = req.user;

        if (!dateInventaire || !stocks || stocks.length === 0) {
            return next(new BadRequestError('Veuillez fournir une date d\'inventaire et au moins un article.'));
        }

        // La logique diffère en fonction du rôle de l'utilisateur.
        if (role === 'Station') {
            if (!entiteId) return next(new BadRequestError('Utilisateur non associé à une station.'));

            // Prépare les entrées de stock pour la station.
            const stockEntries = stocks.map(stock => ({
                stationId: entiteId,
                articleId: stock.articleId,
                quantite: stock.quantite,
                dateInventaire,
                creeParId
            }));

            // Insertion en masse des nouvelles entrées de stock.
            await StockStation.insertMany(stockEntries);
            res.status(201).json({ message: 'Stock de la station enregistré avec succès.' });

        } else if (role === 'Fournisseur') {
            if (!entiteId) return next(new BadRequestError('Utilisateur non associé à un fournisseur.'));
            if (!siteId) return next(new BadRequestError('Veuillez spécifier le site du fournisseur.'));

            // Vérification que le site spécifié appartient bien au fournisseur de l'utilisateur.
            const fournisseur = await Fournisseur.findById(entiteId);
            const siteExists = fournisseur.sites.some(s => s._id.toString() === siteId);
            if (!siteExists) {
                return next(new ForbiddenError('Accès au site non autorisé.'));
            }

            // Prépare les entrées de stock pour le site du fournisseur.
            const stockEntries = stocks.map(stock => ({
                fournisseurId: entiteId,
                siteId: siteId,
                articleId: stock.articleId,
                quantite: stock.quantite,
                dateInventaire,
                creeParId
            }));

            // Insertion en masse des nouvelles entrées de stock.
            await StockFournisseur.insertMany(stockEntries);
            res.status(201).json({ message: 'Stock du fournisseur enregistré avec succès.' });

        } else {
            return next(new ForbiddenError('Rôle non autorisé pour cette action.'));
        }
    } catch (error) {
        next(error);
    }
};
