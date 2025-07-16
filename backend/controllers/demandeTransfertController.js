/**
 * @fileoverview Contrôleur pour la gestion des demandes de transfert d'articles entre stations
 * @module controllers/demandeTransfertController
 * @requires models/demandeTransfertModel
 * @requires utils/appError
 * @requires services/demandeTransfertService
 * @author Gestion Emballages Team
 * @since 1.0.0
 */

// backend/controllers/demandeTransfertController.js
const DemandeTransfert = require('../models/demandeTransfertModel');
const { BadRequestError } = require('../utils/appError');
// Removed asyncHandler for cleaner testing and error handling
const { updateStatusDemandeTransfert } = require('../services/demandeTransfertService');

/**
 * Créer une nouvelle demande de transfert d'articles entre stations.
 * @function createDemandeTransfert
 * @memberof module:controllers/demandeTransfertController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.stationSourceId - ID de la station source du transfert
 * @param {Array<Object>} req.body.articles - Liste des articles à transférer
 * @param {string} req.body.articles[].articleId - ID de l'article
 * @param {number} req.body.articles[].quantiteDemandee - Quantité demandée
 * @param {Object} req.user - Utilisateur connecté (ajouté par le middleware auth)
 * @param {string} req.user._id - ID de l'utilisateur
 * @param {string} req.user.entiteId - ID de la station destination
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la demande de transfert créée avec le statut 201
 * @throws {BadRequestError} Si l'utilisateur n'est pas associé à une station
 * @since 1.0.0
 * @example
 * // POST /api/demandes-transfert
 * // Body: { "stationSourceId": "64f5a1b2c3d4e5f6a7b8c9d0", "articles": [{ "articleId": "64f5a1b2c3d4e5f6a7b8c9d1", "quantiteDemandee": 10 }] }
 * // Response: { "_id": "...", "referenceTransfert": "TR-1234567890", "statut": "Enregistrée", "articles": [...] }
 */
exports.createDemandeTransfert = async (req, res, next) => {
    try {
        const { stationSourceId, articles } = req.body;
        const stationDestinationId = req.user.entiteId; 

        if (!stationDestinationId) {
            return next(new BadRequestError("Utilisateur non associé à une station."));
        }

        const demande = await DemandeTransfert.create({
            referenceTransfert: `TR-${Date.now()}`,
            stationDestinationId,
            stationSourceId,
            articles,
            creeParId: req.user._id,
            historiqueStatuts: [{ statut: 'Enregistrée', date: new Date(), parUtilisateurId: req.user._id }]
        });

        res.status(201).json(demande);
    } catch (error) {
        next(error);
    }
};

/**
 * Mettre à jour le statut d'une demande de transfert.
 * @function updateDemandeTransfertStatut
 * @memberof module:controllers/demandeTransfertController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de la demande de transfert
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.statut - Nouveau statut de la demande
 * @param {Object} req.user - Utilisateur connecté (ajouté par le middleware auth)
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la demande de transfert avec le statut mis à jour
 * @throws {NotFoundError} Si la demande de transfert n'est pas trouvée
 * @throws {BadRequestError} Si le changement de statut n'est pas autorisé
 * @throws {ForbiddenError} Si l'utilisateur n'a pas les permissions requises
 * @since 1.0.0
 * @example
 * // PUT /api/demandes-transfert/64f5a1b2c3d4e5f6a7b8c9d0/statut
 * // Body: { "statut": "Approuvée" }
 * // Response: { "_id": "...", "statut": "Approuvée", "historiqueStatuts": [...] }
 */
exports.updateDemandeTransfertStatut = async (req, res, next) => {
    try {
        const { statut } = req.body;
        const updatedDemande = await updateStatusDemandeTransfert(req.params.id, statut, req.user, req.body);
        res.json(updatedDemande);
    } catch (error) {
        next(error);
    }
};

