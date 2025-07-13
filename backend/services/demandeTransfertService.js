// backend/services/demandeTransfertService.js
const DemandeTransfert = require('../models/demandeTransfertModel');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/appError');
const { canTransitionDemande, getTransitionDemandeError } = require("./workflowService");

/**
 * @description Met à jour le statut d'une demande de transfert et applique la logique métier associée.
 * @param {string} demandeId - L'ID de la demande à mettre à jour.
 * @param {string} newStatus - Le nouveau statut cible.
 * @param {object} user - L'objet utilisateur qui effectue l'action.
 * @param {object} data - Les données supplémentaires nécessaires pour la transition.
 * @returns {Promise<Document>} Le document de demande de transfert mis à jour.
 */
async function updateStatusDemandeTransfert(demandeId, newStatus, user, data) {
    const demande = await DemandeTransfert.findById(demandeId);

    if (!demande) {
        throw new NotFoundError('Demande de transfert non trouvée');
    }

    // 1. Validation du workflow
    if (!canTransitionDemande(demande, newStatus, user)) {
        const errorMessage = getTransitionDemandeError(demande, newStatus, user);
        throw new ForbiddenError(errorMessage);
    }

    const { motifRejet, articles, informationsExpedition, informationsReception } = data;

    // 2. Logique de mise à jour des données
    switch (newStatus) {
        case 'Rejetée':
            if (!motifRejet) throw new BadRequestError('Un motif de rejet est obligatoire.');
            demande.motifRejet = motifRejet;
            break;
        case 'Confirmée':
            articles.forEach(articleUpdate => {
                const articleDansDemande = demande.articles.find(a => a._id.toString() === articleUpdate._id);
                if (articleDansDemande) articleDansDemande.quantiteConfirmee = articleUpdate.quantiteConfirmee;
            });
            break;
        case 'Expédiée':
            if (!informationsExpedition || !informationsExpedition.bonLivraisonUrl) throw new BadRequestError('Le Bon de Livraison est obligatoire.');
            demande.informationsExpedition = {
                dateExpedition: new Date(),
                bonLivraisonUrl: informationsExpedition.bonLivraisonUrl
            };
            break;
        case 'Réceptionnée':
            if (!informationsReception || !informationsReception.bonLivraisonEmargeUrl) throw new BadRequestError('Le Bon de Livraison émargé est obligatoire.');
            articles.forEach(articleUpdate => {
                const articleDansDemande = demande.articles.find(a => a._id.toString() === articleUpdate._id);
                if (articleDansDemande) articleDansDemande.quantiteRecue = articleUpdate.quantiteRecue;
            });
            demande.informationsReception = {
                dateReception: new Date(),
                bonLivraisonEmargeUrl: informationsReception.bonLivraisonEmargeUrl,
            };
            break;
    }

    // 3. Mise à jour du statut et de l'historique
    demande.statut = newStatus;
    demande.historiqueStatuts.push({ statut: newStatus, date: new Date(), parUtilisateurId: user._id });

    return await demande.save();
}

module.exports = { updateStatusDemandeTransfert };

