// backend/controllers/stationController.js
const Station = require('../models/stationModel');

// @desc    Créer une nouvelle station
// @route   POST /api/stations
// @access  Privé (Manager, Gestionnaire)
exports.createStation = async (req, res) => {
    try {
        const { nom, identifiantInterne, adresse, contactPrincipal } = req.body;
        const station = await Station.create({ nom, identifiantInterne, adresse, contactPrincipal });
        res.status(201).json(station);
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la création de la station', error: error.message });
    }
};

// @desc    Obtenir toutes les stations
// @route   GET /api/stations
// @access  Privé (Tous les utilisateurs connectés)
exports.getStations = async (req, res) => {
    try {
        const stations = await Station.find({ isActive: true });
        res.json(stations);
    } catch (error) {
        res.status(500).json({ message: 'Erreur du serveur' });
    }
};

// @desc    Mettre à jour une station
// @route   PUT /api/stations/:id
// @access  Privé (Manager, Gestionnaire)
exports.updateStation = async (req, res) => {
    try {
        const station = await Station.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Renvoie le document mis à jour
            runValidators: true,
        });
        if (!station) {
            return res.status(404).json({ message: 'Station non trouvée' });
        }
        res.json(station);
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la mise à jour', error: error.message });
    }
};

// @desc    Supprimer (désactiver) une station
// @route   DELETE /api/stations/:id
// @access  Privé (Manager, Gestionnaire)
exports.deleteStation = async (req, res) => {
    try {
        // On ne supprime pas vraiment, on désactive (soft delete)
        const station = await Station.findByIdAndUpdate(req.params.id, { isActive: false });
        if (!station) {
            return res.status(404).json({ message: 'Station non trouvée' });
        }
        res.json({ message: 'Station désactivée avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur du serveur' });
    }
};