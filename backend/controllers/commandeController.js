/**
 * @fileoverview Contrôleur pour la gestion des commandes fournisseurs
 * @module controllers/commandeController
 * @requires models/commandeModel
 * @requires models/commandeGlobaleModel
 * @requires utils/appError
 * @requires services/commandeService
 * @author Gestion Emballages Team
 * @since 1.0.0
 */

// backend/controllers/commandeController.js
const Commande = require("../models/commandeModel");
const CommandeGlobale = require("../models/commandeGlobaleModel");
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/appError');
// Removed asyncHandler for cleaner testing and error handling
const { updateStatusCommande } = require('../services/commandeService');

/**
 * Obtenir une commande par son ID avec les détails peuplés.
 * @function getCommandeById
 * @memberof module:controllers/commandeController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de la commande
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie les détails de la commande avec les informations peuplées
 * @throws {NotFoundError} Si la commande n'est pas trouvée
 * @since 1.0.0
 * @example
 * // GET /api/commandes/64f5a1b2c3d4e5f6a7b8c9d0
 * // Response: { "_id": "...", "stationId": { "nom": "Station A" }, "fournisseurId": { "nom": "Fournisseur X" }, "articles": [...] }
 */
exports.getCommandeById = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour le statut d'une commande en suivant le workflow défini.
 * @function updateCommandeStatut
 * @memberof module:controllers/commandeController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de la commande
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.statut - Nouveau statut de la commande
 * @param {Object} req.user - Utilisateur connecté (ajouté par le middleware auth)
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la commande avec le statut mis à jour
 * @throws {NotFoundError} Si la commande n'est pas trouvée
 * @throws {BadRequestError} Si le changement de statut n'est pas autorisé
 * @throws {ForbiddenError} Si l'utilisateur n'a pas les permissions requises
 * @since 1.0.0
 * @example
 * // PUT /api/commandes/64f5a1b2c3d4e5f6a7b8c9d0/statut
 * // Body: { "statut": "Confirmée" }
 * // Response: { "_id": "...", "statut": "Confirmée", "updatedAt": "..." }
 */
exports.updateCommandeStatut = async (req, res, next) => {
  try {
    const { statut } = req.body;
    const updatedCommande = await updateStatusCommande(req.params.id, statut, req.user, req.body);
    res.json(updatedCommande);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir toutes les commandes, filtrées selon le rôle de l'utilisateur.
 * @function getCommandes
 * @memberof module:controllers/commandeController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.user - Utilisateur connecté (ajouté par le middleware auth)
 * @param {string} req.user.role - Rôle de l'utilisateur (Fournisseur, Station, Gestionnaire, Manager)
 * @param {string} req.user.entiteId - ID de l'entité associée à l'utilisateur
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la liste des commandes filtrées selon le rôle
 * @since 1.0.0
 * @example
 * // GET /api/commandes
 * // Response: [{ "_id": "...", "stationId": { "nom": "Station A" }, "fournisseurId": { "nom": "Fournisseur X" }, "statut": "Enregistrée" }]
 */
exports.getCommandes = async (req, res, next) => {
  try {
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
        select: "codeArticle designation categorie",
      })
      .sort({ createdAt: -1 });

    res.json(commandes);
  } catch (error) {
    next(error);
  }
};

/**
 * Annuler une commande fournisseur (suppression logique).
 * @function deleteCommande
 * @memberof module:controllers/commandeController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de la commande à annuler
 * @param {Object} req.user - Utilisateur connecté (ajouté par le middleware auth)
 * @param {string} req.user.role - Rôle de l'utilisateur (doit être 'Station')
 * @param {string} req.user.entiteId - ID de la station
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie un message de confirmation d'annulation
 * @throws {NotFoundError} Si la commande n'est pas trouvée
 * @throws {ForbiddenError} Si l'utilisateur n'a pas les permissions ou n'est pas propriétaire de la commande
 * @throws {BadRequestError} Si la commande n'est pas au statut 'Enregistrée'
 * @since 1.0.0
 * @example
 * // DELETE /api/commandes/64f5a1b2c3d4e5f6a7b8c9d0
 * // Response: { "message": "Commande fournisseur annulée avec succès." }
 */
exports.deleteCommande = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

