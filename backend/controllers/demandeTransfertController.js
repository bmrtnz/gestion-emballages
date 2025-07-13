// backend/controllers/demandeTransfertController.js
const DemandeTransfert = require('../models/demandeTransfertModel');
const { BadRequestError } = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const { updateStatusDemandeTransfert } = require('../services/demandeTransfertService');

/**
 * @description Créer une nouvelle demande de transfert d'articles entre stations.
 * @route POST /api/demandes-transfert
 * @access Privé (Station)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.createDemandeTransfert = asyncHandler(async (req, res, next) => {
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
});

/**
 * @description Mettre à jour le statut d'une demande de transfert.
 * @route PUT /api/demandes-transfert/:id/statut
 * @access Privé (Station, Gestionnaire, Manager)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.updateDemandeTransfertStatut = asyncHandler(async (req, res, next) => {
    const { statut } = req.body;
    const updatedDemande = await updateStatusDemandeTransfert(req.params.id, statut, req.user, req.body);
    res.json(updatedDemande);
});

