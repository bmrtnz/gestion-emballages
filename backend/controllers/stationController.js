/**
 * @fileoverview Contrôleur pour la gestion des stations
 * @module controllers/stationController
 * @requires models/stationModel
 * @requires utils/appError
 * @author Gestion Emballages Team
 * @since 1.0.0
 */

// backend/controllers/stationController.js
const Station = require('../models/stationModel');
const { NotFoundError } = require('../utils/appError');
// Removed asyncHandler for cleaner testing and error handling

/**
 * Créer une nouvelle station.
 * @function createStation
 * @memberof module:controllers/stationController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.nom - Nom de la station
 * @param {string} req.body.identifiantInterne - Identifiant interne de la station
 * @param {string} req.body.adresse - Adresse de la station
 * @param {string} [req.body.contactPrincipal] - Contact principal de la station
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la station créée avec le statut 201
 * @since 1.0.0
 * @example
 * // POST /api/stations
 * // Body: { "nom": "Station Nord", "identifiantInterne": "STN001", "adresse": "123 Rue de la Station", "contactPrincipal": "Jean Dupont" }
 * // Response: { "_id": "...", "nom": "Station Nord", "identifiantInterne": "STN001", "adresse": "123 Rue de la Station", "isActive": true }
 */
exports.createStation = async (req, res, next) => {
    try {
        const { nom, identifiantInterne, adresse, contactPrincipal } = req.body;
        const station = await Station.create({ nom, identifiantInterne, adresse, contactPrincipal });
        res.status(201).json(station);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtenir toutes les stations avec pagination, recherche et filtres.
 * @function getStations
 * @memberof module:controllers/stationController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.pagination - Paramètres de pagination ajoutés par le middleware
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la liste paginée des stations avec métadonnées
 * @since 1.0.0
 * @example
 * // GET /api/stations?page=2&limit=10&search=nord&showInactive=false
 * // Response: { data: [...], pagination: { currentPage: 2, totalPages: 3, ... }, filters: { search: 'nord', ... } }
 */
exports.getStations = async (req, res, next) => {
    try {
        const { page, limit, skip, search, sortBy, sortOrder, filters } = req.pagination;
        
        // Construction de la query de base
        let query = {};
        
        // Gestion du filtre de statut
        if (filters.status === 'active') {
            query.isActive = true;
        } else if (filters.status === 'inactive') {
            query.isActive = false;
        }
        // Si status est vide ou 'tout', on ne filtre pas sur isActive
        
        // Ajout de la recherche sur nom, identifiantInterne, adresse et contact
        if (search) {
            query.$or = [
                { nom: { $regex: search, $options: 'i' } },
                { identifiantInterne: { $regex: search, $options: 'i' } },
                { 'adresse.rue': { $regex: search, $options: 'i' } },
                { 'adresse.ville': { $regex: search, $options: 'i' } },
                { 'adresse.codePostal': { $regex: search, $options: 'i' } },
                { 'adresse.pays': { $regex: search, $options: 'i' } },
                { 'contactPrincipal.nom': { $regex: search, $options: 'i' } },
                { 'contactPrincipal.email': { $regex: search, $options: 'i' } },
                { 'contactPrincipal.telephone': { $regex: search, $options: 'i' } }
            ];
        }
        
        // Requête avec pagination
        const stations = await Station.find(query)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);
        
        const totalCount = await Station.countDocuments(query);
        
        res.json(req.pagination.buildResponse(stations, totalCount));
    } catch (error) {
        next(error);
    }
};

/**
 * Mettre à jour une station par son ID.
 * @function updateStation
 * @memberof module:controllers/stationController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de la station à mettre à jour
 * @param {Object} req.body - Corps de la requête
 * @param {string} [req.body.nom] - Nouveau nom de la station
 * @param {string} [req.body.identifiantInterne] - Nouvel identifiant interne
 * @param {string} [req.body.adresse] - Nouvelle adresse
 * @param {string} [req.body.contactPrincipal] - Nouveau contact principal
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la station mise à jour
 * @throws {NotFoundError} Si la station n'est pas trouvée
 * @since 1.0.0
 * @example
 * // PUT /api/stations/64f5a1b2c3d4e5f6a7b8c9d0
 * // Body: { "nom": "Station Nord Rénovée", "contactPrincipal": "Marie Martin" }
 * // Response: { "_id": "...", "nom": "Station Nord Rénovée", "contactPrincipal": "Marie Martin", ... }
 */
exports.updateStation = async (req, res, next) => {
    try {
        const station = await Station.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Renvoie le document mis à jour.
            runValidators: true, // Exécute les validateurs du schéma.
        });
        if (!station) {
            return next(new NotFoundError('Station non trouvée'));
        }
        res.json(station);
    } catch (error) {
        next(error);
    }
};

/**
 * Désactiver une station (suppression logique).
 * @function deleteStation
 * @memberof module:controllers/stationController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de la station à désactiver
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie un message de confirmation de désactivation
 * @throws {NotFoundError} Si la station n'est pas trouvée
 * @since 1.0.0
 * @example
 * // DELETE /api/stations/64f5a1b2c3d4e5f6a7b8c9d0
 * // Response: { "message": "Station désactivée avec succès" }
 */
exports.deactivateStation = async (req, res, next) => {
    try {
        const station = await Station.findById(req.params.id);
        
        if (!station) {
            return next(new NotFoundError('Station non trouvée'));
        }
        
        station.isActive = false;
        await station.save();
        
        res.json({ message: 'Station désactivée avec succès' });
    } catch (error) {
        next(error);
    }
};

/**
 * Réactiver une station (annuler la suppression logique).
 * @function reactivateStation
 * @memberof module:controllers/stationController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de la station à réactiver
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie un message de confirmation de réactivation
 * @throws {NotFoundError} Si la station n'est pas trouvée
 * @since 1.0.0
 * @example
 * // PATCH /api/stations/64f5a1b2c3d4e5f6a7b8c9d0/reactivate
 * // Response: { "message": "Station réactivée avec succès" }
 */
exports.reactivateStation = async (req, res, next) => {
    try {
        const station = await Station.findById(req.params.id);
        
        if (!station) {
            return next(new NotFoundError('Station non trouvée'));
        }
        
        station.isActive = true;
        await station.save();
        
        res.json({ message: 'Station réactivée avec succès' });
    } catch (error) {
        next(error);
    }
};
