// backend/controllers/commandeGlobaleController.js
const CommandeGlobale = require("../models/commandeGlobaleModel");
const {
  calculateStatutGeneral,
} = require("../services/commandeGlobaleService");
const Commande = require("../models/commandeModel");
const { minioClient, bucketName } = require("../config/minioClient");
const { NotFoundError } = require("../utils/appError");
const asyncHandler = require('../utils/asyncHandler');

/**
 * @description Obtenir les commandes globales, filtrées par station si l'utilisateur a le rôle 'Station'.
 * @route GET /api/commandes-globales
 * @access Privé (Manager, Gestionnaire, Station)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.getCommandesGlobales = asyncHandler(async (req, res, next) => {
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
});

/**
 * @description Supprimer une commande globale et toutes ses données associées (commandes, documents).
 * @route DELETE /api/commandes-globales/:id
 * @access Privé (Manager, Gestionnaire)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.deleteCommandeGlobale = asyncHandler(async (req, res, next) => {
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
});

