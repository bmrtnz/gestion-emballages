// backend/controllers/stockController.js
const StockStation = require('../models/stockStationModel');
const StockFournisseur = require('../models/stockFournisseurModel');
const Fournisseur = require('../models/fournisseurModel');
const asyncHandler = require('../utils/asyncHandler');
const { BadRequestError, ForbiddenError } = require('../utils/appError');

/**
 * @description Soumettre un inventaire de stock pour une station ou un site fournisseur.
 * @route POST /api/stocks
 * @access Privé (Station, Fournisseur)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.submitStock = asyncHandler(async (req, res, next) => {
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
});
