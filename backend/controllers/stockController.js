// backend/controllers/stockController.js
const StockStation = require('../models/stockStationModel');
const StockFournisseur = require('../models/stockFournisseurModel');
const Fournisseur = require('../models/fournisseurModel');

// @desc    Soumettre un inventaire de stock
// @route   POST /api/stocks
// @access  Privé (Station, Fournisseur)
exports.submitStock = async (req, res) => {
    const { dateInventaire, stocks, siteId } = req.body; // `siteId` est pour les fournisseurs
    const { role, _id: creeParId, entiteId } = req.user;

    if (!dateInventaire || !stocks || stocks.length === 0) {
        return res.status(400).json({ message: 'Veuillez fournir une date d\'inventaire et au moins un article.' });
    }

    try {
        if (role === 'Station') {
            if (!entiteId) return res.status(400).json({ message: 'Utilisateur non associé à une station.' });

            const stockEntries = stocks.map(stock => ({
                stationId: entiteId,
                articleId: stock.articleId,
                quantite: stock.quantite,
                dateInventaire,
                creeParId
            }));

            await StockStation.insertMany(stockEntries);
            res.status(201).json({ message: 'Stock de la station enregistré avec succès.' });

        } else if (role === 'Fournisseur') {
            if (!entiteId) return res.status(400).json({ message: 'Utilisateur non associé à un fournisseur.' });
            if (!siteId) return res.status(400).json({ message: 'Veuillez spécifier le site du fournisseur.' });

            // Vérifier que le site appartient bien au fournisseur de l'utilisateur
            const fournisseur = await Fournisseur.findById(entiteId);
            const siteExists = fournisseur.sites.some(s => s._id.toString() === siteId);
            if (!siteExists) {
                return res.status(403).json({ message: 'Accès au site non autorisé.' });
            }

            const stockEntries = stocks.map(stock => ({
                fournisseurId: entiteId,
                siteId: siteId,
                articleId: stock.articleId,
                quantite: stock.quantite,
                dateInventaire,
                creeParId
            }));

            await StockFournisseur.insertMany(stockEntries);
            res.status(201).json({ message: 'Stock du fournisseur enregistré avec succès.' });

        } else {
            return res.status(403).json({ message: 'Rôle non autorisé pour cette action.' });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la soumission du stock", error: error.message });
    }
};