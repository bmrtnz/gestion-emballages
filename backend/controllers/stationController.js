// backend/controllers/stationController.js
const Station = require('../models/stationModel');
const { NotFoundError } = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @description Créer une nouvelle station.
 * @route POST /api/stations
 * @access Privé (Manager, Gestionnaire)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.createStation = asyncHandler(async (req, res, next) => {
    const { nom, identifiantInterne, adresse, contactPrincipal } = req.body;
    const station = await Station.create({ nom, identifiantInterne, adresse, contactPrincipal });
    res.status(201).json(station);
});

/**
 * @description Obtenir toutes les stations actives.
 * @route GET /api/stations
 * @access Privé (Tous les utilisateurs connectés)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.getStations = asyncHandler(async (req, res, next) => {
    const stations = await Station.find({ isActive: true });
    res.json(stations);
});

/**
 * @description Mettre à jour une station par son ID.
 * @route PUT /api/stations/:id
 * @access Privé (Manager, Gestionnaire)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.updateStation = asyncHandler(async (req, res, next) => {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // Renvoie le document mis à jour.
        runValidators: true, // Exécute les validateurs du schéma.
    });
    if (!station) {
        return next(new NotFoundError('Station non trouvée'));
    }
    res.json(station);
});

/**
 * @description Désactiver une station (suppression logique).
 * @route DELETE /api/stations/:id
 * @access Privé (Manager, Gestionnaire)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.deleteStation = asyncHandler(async (req, res, next) => {
    // La station n'est pas supprimée de la base, mais marquée comme inactive.
    const station = await Station.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!station) {
        return next(new NotFoundError('Station non trouvée'));
    }
    res.json({ message: 'Station désactivée avec succès' });
});
