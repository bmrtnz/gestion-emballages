/**
 * @fileoverview Contrôleur pour la gestion des commandes globales
 * @module controllers/commandeGlobaleController
 * @requires models/commandeGlobaleModel
 * @requires services/commandeGlobaleService
 * @requires models/commandeModel
 * @requires config/minioClient
 * @requires utils/appError
 * @author Gestion Emballages Team
 * @since 1.0.0
 */

// backend/controllers/commandeGlobaleController.js
const CommandeGlobale = require("../models/commandeGlobaleModel");
const {
  calculateStatutGeneral,
} = require("../services/commandeGlobaleService");
const Commande = require("../models/commandeModel");
const { minioClient, bucketName } = require("../config/minioClient");
const { NotFoundError } = require("../utils/appError");
// Removed asyncHandler for cleaner testing and error handling

/**
 * Obtenir les commandes globales, filtrées par station si l'utilisateur a le rôle 'Station'.
 * @function getCommandesGlobales
 * @memberof module:controllers/commandeGlobaleController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.user - Utilisateur connecté (ajouté par le middleware auth)
 * @param {string} req.user.role - Rôle de l'utilisateur (Manager, Gestionnaire, Station)
 * @param {string} req.user.entiteId - ID de l'entité associée à l'utilisateur
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la liste des commandes globales avec leurs commandes fournisseurs
 * @since 1.0.0
 * @example
 * // GET /api/commandes-globales
 * // Response: [{ "_id": "...", "stationId": { "nom": "Station A" }, "commandesFournisseurs": [...], "statutGeneral": "En cours" }]
 */
exports.getCommandesGlobales = async (req, res, next) => {
  try {
    let query = {};
    // Si l'utilisateur est une station, il ne voit que ses propres commandes globales.
    if (req.user.role === "Station") {
      query.stationId = req.user.entiteId;
    }

    const commandes = await CommandeGlobale.find(query)
      .populate({
        path: "commandesFournisseurs",
        select: "numeroCommande statut montantTotalHT informationsExpedition fournisseurId",
        populate: { path: "fournisseurId", select: "nom" }, // Peuplement imbriqué pour le nom du fournisseur.
      })
      .populate("stationId", "nom")
      .sort({ createdAt: -1 });

    // Le statut général est recalculé à chaque requête pour assurer sa cohérence.
    // C'est une forme d'auto-réparation des données.
    for (const commande of commandes) {
      const newStatus = calculateStatutGeneral(commande.commandesFournisseurs);
      if (commande.statutGeneral !== newStatus) {
        commande.statutGeneral = newStatus;
        await commande.save(); // Sauvegarde silencieuse de la correction.
      }
    }

    res.json(commandes);
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer une commande globale et toutes ses données associées (commandes, documents).
 * @function deleteCommandeGlobale
 * @memberof module:controllers/commandeGlobaleController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de la commande globale à supprimer
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie un message de confirmation de suppression
 * @throws {NotFoundError} Si la commande globale n'est pas trouvée
 * @since 1.0.0
 * @example
 * // DELETE /api/commandes-globales/64f5a1b2c3d4e5f6a7b8c9d0
 * // Response: { "message": "Commande globale et toutes les données associées ont été supprimées." }
 */
exports.deleteCommandeGlobale = async (req, res, next) => {
  try {
    // Recherche de la commande globale et de ses commandes fournisseurs associées.
    const commandeGlobale = await CommandeGlobale.findById(
      req.params.id
    ).populate("commandesFournisseurs");

    if (!commandeGlobale) {
      return next(new NotFoundError("Commande globale non trouvée."));
    }

    // Collecte de tous les documents (fichiers) liés à la commande pour les supprimer de MinIO.
    const documentsToDelete = [];
    for (const commande of commandeGlobale.commandesFournisseurs) {
      if (commande.informationsExpedition && commande.informationsExpedition.bonLivraisonUrl) {
        documentsToDelete.push(commande.informationsExpedition.bonLivraisonUrl);
      }
      if (commande.informationsReception && commande.informationsReception.bonLivraisonEmargeUrl) {
        documentsToDelete.push(commande.informationsReception.bonLivraisonEmargeUrl);
      }
      // Ajout des photos des non-conformités à la liste de suppression.
      if (commande.nonConformitesReception) {
        commande.nonConformitesReception.forEach((nc) => {
          if (nc.photosUrl) documentsToDelete.push(...nc.photosUrl);
        });
      }
      if (commande.nonConformitesPosterieures) {
        commande.nonConformitesPosterieures.forEach((nc) => {
          if (nc.photosUrl) documentsToDelete.push(...nc.photosUrl);
        });
      }
    }

    // Suppression des objets dans le bucket MinIO.
    if (documentsToDelete.length > 0) {
      // Extraction des noms de fichiers (clés) à partir des URLs complètes.
      const objectNames = documentsToDelete.map(url => url.substring(url.lastIndexOf('/') + 1));
      await minioClient.removeObjects(bucketName, objectNames);
    }

    // Suppression de toutes les commandes fournisseurs associées.
    await Commande.deleteMany({
      _id: { $in: commandeGlobale.commandesFournisseurs.map((c) => c._id) },
    });

    // Suppression de la commande globale elle-même.
    await CommandeGlobale.findByIdAndDelete(req.params.id);

    res.json({
      message: "Commande globale et toutes les données associées ont été supprimées.",
    });
  } catch (error) {
    next(error);
  }
};

