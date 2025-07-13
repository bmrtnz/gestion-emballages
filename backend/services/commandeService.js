// backend/services/commandeService.js
const Commande = require("../models/commandeModel");
const CommandeGlobale = require("../models/commandeGlobaleModel");
const { canTransitionCommande, getTransitionCommandeError } = require("./workflowService");
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/appError');
const { calculateStatutGeneral } = require("./commandeGlobaleService");

/**
 * @description Met à jour le statut d'une commande et applique la logique métier associée.
 * @param {string} commandeId - L'ID de la commande à mettre à jour.
 * @param {string} newStatus - Le nouveau statut cible.
 * @param {object} user - L'objet utilisateur qui effectue l'action.
 * @param {object} data - Les données supplémentaires nécessaires pour la transition (articles, etc.).
 * @returns {Promise<Document>} Le document de commande mis à jour.
 */
async function updateStatusCommande(commandeId, newStatus, user, data) {
    const commande = await Commande.findById(commandeId);

    if (!commande) {
        throw new NotFoundError("Commande non trouvée");
    }

    // 1. Validation du workflow
    if (!canTransitionCommande(commande, newStatus, user)) {
        const errorMessage = getTransitionCommandeError(commande, newStatus, user);
        throw new ForbiddenError(errorMessage);
    }

    // 2. Logique de mise à jour des données en fonction du statut
    switch (newStatus) {
        case "Confirmée":
            data.articles.forEach((articleUpdate) => {
                const articleDansCommande = commande.articles.find(a => a._id.toString() === articleUpdate._id);
                if (articleDansCommande) {
                    articleDansCommande.dateLivraisonConfirmee = articleUpdate.dateLivraisonConfirmee;
                }
            });
            break;
        case "Expédiée":
            commande.informationsExpedition = {
                dateExpedition: new Date(),
                transporteur: data.informationsExpedition.transporteur,
                numeroSuivi: data.informationsExpedition.numeroSuivi,
                bonLivraisonUrl: data.informationsExpedition.bonLivraisonUrl,
            };
            break;
        case "Réceptionnée":
            data.articles.forEach((articleUpdate) => {
                const articleDansCommande = commande.articles.find(a => a._id.toString() === articleUpdate._id);
                if (articleDansCommande) {
                    articleDansCommande.quantiteRecue = articleUpdate.quantiteRecue;
                }
            });
            commande.informationsReception = {
                dateReception: data.informationsReception.dateReception,
                bonLivraisonEmargeUrl: data.informationsReception.bonLivraisonEmargeUrl,
            };
            if (data.nonConformitesReception && data.nonConformitesReception.length > 0) {
                commande.nonConformitesReception = data.nonConformitesReception;
            }
            break;
        case "Clôturée":
        case "Facturée":
        case "Archivée":
            // Aucune donnée supplémentaire n'est nécessaire pour ces étapes.
            break;
        default:
            throw new BadRequestError("Statut invalide.");
    }

    // 3. Mise à jour du statut et de l'historique
    commande.statut = newStatus;
    commande.historiqueStatuts.push({
        statut: newStatus,
        date: new Date(),
        parUtilisateurId: user._id,
    });

    const updatedCommande = await commande.save();

    // 4. Recalculer et mettre à jour le statut de la commande globale parente
    const commandeGlobale = await CommandeGlobale.findById(updatedCommande.commandeGlobaleId).populate('commandesFournisseurs');
    if (commandeGlobale) {
        commandeGlobale.statutGeneral = calculateStatutGeneral(commandeGlobale.commandesFournisseurs);
        await commandeGlobale.save();
    }

    return updatedCommande;
}

module.exports = { updateStatusCommande };

