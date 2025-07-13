// backend/controllers/commandeController.js
const Commande = require("../models/commandeModel");
const CommandeGlobale = require("../models/commandeGlobaleModel");
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const { updateStatusCommande } = require('../services/commandeService');

/**
 * @description Obtenir une commande par son ID avec les détails peuplés.
 * @route GET /api/commandes/:id
 * @access Privé
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.getCommandeById = asyncHandler(async (req, res, next) => {
  const commande = await Commande.findById(req.params.id)
    .populate("stationId", "nom")
    .populate("fournisseurId", "nom")
    .populate({
      path: "articles.articleId",
      select: "codeArticle designation",
    });

  if (!commande) {
    return next(new NotFoundError("Commande non trouvée"));
  }
  
  res.json(commande);
});

/**
 * @description Mettre à jour le statut d'une commande en suivant le workflow défini.
 * @route PUT /api/commandes/:id/statut
 * @access Privé (Fournisseur, Station, Gestionnaire)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.updateCommandeStatut = asyncHandler(async (req, res, next) => {
  const { statut } = req.body;
  const updatedCommande = await updateStatusCommande(req.params.id, statut, req.user, req.body);
  res.json(updatedCommande);
});

/**
 * @description Obtenir toutes les commandes, filtrées selon le rôle de l'utilisateur.
 * @route GET /api/commandes
 * @access Privé
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.getCommandes = asyncHandler(async (req, res, next) => {
  let query = {};
  const { role, entiteId } = req.user;

  if (role === "Fournisseur") {
    query.fournisseurId = entiteId;
  } else if (role === "Station") {
    query.stationId = entiteId;
  }

  const commandes = await Commande.find(query)
    .populate("stationId", "nom")
    .populate("fournisseurId", "nom")
    .populate({
      path: "articles.articleId",
      select: "codeArticle designation",
    })
    .sort({ createdAt: -1 });

  res.json(commandes);
});

/**
 * @description Annuler une commande fournisseur (suppression logique).
 * @route DELETE /api/commandes/:id
 * @access Privé (Station)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.deleteCommande = asyncHandler(async (req, res, next) => {
    const commande = await Commande.findById(req.params.id);

    if (!commande) {
        return next(new NotFoundError("Commande non trouvée."));
    }

    if (req.user.role !== 'Station' || !req.user.entiteId.equals(commande.stationId)) {
        return next(new ForbiddenError("Action non autorisée."));
    }

    if (commande.statut !== 'Enregistrée') {
        return next(new BadRequestError("Vous ne pouvez annuler qu'une commande qui est au statut 'Enregistrée'."));
    }

    await Commande.findByIdAndDelete(req.params.id);

    const commandeGlobale = await CommandeGlobale.findById(commande.commandeGlobaleId);
    if (commandeGlobale) {
        commandeGlobale.commandesFournisseurs.pull(req.params.id);
        if (commandeGlobale.commandesFournisseurs.length === 0) {
            await CommandeGlobale.findByIdAndDelete(commande.commandeGlobaleId);
        } else {
            await commandeGlobale.save();
        }
    }

    res.json({ message: "Commande fournisseur annulée avec succès." });
});

