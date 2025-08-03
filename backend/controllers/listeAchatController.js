/**
 * @fileoverview Contrôleur pour la gestion des listes d'achat des stations
 * @module controllers/listeAchatController
 * @requires models/listeAchatModel
 * @requires models/commandeModel
 * @requires models/commandeGlobaleModel
 * @requires models/articleModel
 * @requires utils/appError
 * @author Gestion Emballages Team
 * @since 1.0.0
 */

// backend/controllers/listeAchatController.js
const ListeAchat = require("../models/listeAchatModel");
const Commande = require("../models/commandeModel");
const CommandeGlobale = require("../models/commandeGlobaleModel");
const Article = require("../models/articleModel");
const { NotFoundError, BadRequestError } = require('../utils/appError');
// Removed asyncHandler for cleaner testing and error handling

/**
 * Obtenir la liste d'achat en cours (statut 'Brouillon') pour la station de l'utilisateur.
 * Si elle n'existe pas, la créer.
 * @function getOrCreateListeAchat
 * @memberof module:controllers/listeAchatController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.user - Utilisateur connecté (ajouté par le middleware auth)
 * @param {string} req.user._id - ID de l'utilisateur
 * @param {string} req.user.entiteId - ID de la station
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la liste d'achat existante ou nouvellement créée
 * @throws {BadRequestError} Si l'utilisateur n'est pas associé à une station
 * @since 1.0.0
 * @example
 * // GET /api/listes-achat
 * // Response: { "_id": "...", "stationId": "...", "statut": "Brouillon", "articles": [] }
 */
exports.getOrCreateListeAchat = async (req, res, next) => {
  try {
    const stationId = req.user.entiteId;
    if (!stationId) {
      return next(new BadRequestError("Cet utilisateur n'est associé à aucune station."));
    }
    
    // Recherche d'une liste existante au statut 'Brouillon'.
    let listeAchat = await ListeAchat.findOne({
      stationId,
      statut: "Brouillon",
    });

    // Si aucune liste n'est trouvée, en créer une nouvelle.
    if (!listeAchat) {
      listeAchat = await ListeAchat.create({
        stationId,
        creeParId: req.user._id,
        articles: [],
      });
    }
    res.json(listeAchat);
  } catch (error) {
    next(error);
  }
};

/**
 * Ajouter un article à la liste d'achat 'Brouillon' de la station.
 * @function updateItemInListeAchat
 * @memberof module:controllers/listeAchatController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.articleId - ID de l'article à ajouter
 * @param {string} req.body.fournisseurId - ID du fournisseur
 * @param {number} req.body.quantite - Quantité demandée
 * @param {Date} [req.body.dateSouhaiteeLivraison] - Date souhaitée de livraison
 * @param {Object} req.user - Utilisateur connecté (ajouté par le middleware auth)
 * @param {string} req.user.entiteId - ID de la station
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la liste d'achat mise à jour
 * @throws {NotFoundError} Si aucune liste d'achat brouillon n'est trouvée
 * @since 1.0.0
 * @example
 * // POST /api/listes-achat
 * // Body: { "articleId": "64f5a1b2c3d4e5f6a7b8c9d0", "fournisseurId": "64f5a1b2c3d4e5f6a7b8c9d1", "quantite": 10 }
 * // Response: { "_id": "...", "articles": [{ "articleId": "...", "quantite": 10, ... }] }
 */
exports.updateItemInListeAchat = async (req, res, next) => {
  try {
    const itemData = req.body;
    const stationId = req.user.entiteId;
    
    const listeAchat = await ListeAchat.findOne({
      stationId,
      statut: "Brouillon",
    });

    if (!listeAchat) {
      return next(new NotFoundError("Aucune liste d'achat brouillon trouvée."));
    }

    // Ajout de l'article au tableau des articles de la liste.
    listeAchat.articles.push(itemData);

    await listeAchat.save();
    res.json(listeAchat);
  } catch (error) {
    next(error);
  }
};

/**
 * Valider la liste d'achat, ce qui la transforme en commandes.
 * @function validateListeAchat
 * @memberof module:controllers/listeAchatController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.user - Utilisateur connecté (ajouté par le middleware auth)
 * @param {string} req.user._id - ID de l'utilisateur
 * @param {string} req.user.entiteId - ID de la station
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie un message de confirmation avec l'ID de la commande globale créée
 * @throws {BadRequestError} Si la liste d'achat est vide
 * @since 1.0.0
 * @example
 * // POST /api/listes-achat/validate
 * // Response: { "message": "Commandes créées avec succès", "commandeGlobaleId": "64f5a1b2c3d4e5f6a7b8c9d0" }
 */
exports.validateListeAchat = async (req, res, next) => {
  try {
    const stationId = req.user.entiteId;
    const listeAchat = await ListeAchat.findOne({
      stationId,
      statut: "Brouillon",
    }).populate("articles.articleId"); // Peuple les détails de chaque article.

    if (!listeAchat || listeAchat.articles.length === 0) {
      return next(new BadRequestError("La liste d'achat est vide"));
    }

    // 1. Regroupement des articles par fournisseur pour créer une commande par fournisseur.
    const commandesParFournisseur = new Map();
    for (const item of listeAchat.articles) {
      const fournisseurId = item.fournisseurId.toString();
      if (!commandesParFournisseur.has(fournisseurId)) {
        commandesParFournisseur.set(fournisseurId, []);
      }
      commandesParFournisseur.get(fournisseurId).push(item);
    }

    let montantTotalGlobal = 0;
    const commandesCreesIds = [];

    // 2. Création d'une commande par fournisseur.
    for (const [fournisseurId, items] of commandesParFournisseur.entries()) {
      let montantTotalCommande = 0;
      const articlesDeCommande = [];

      for (const item of items) {
        // 3. "Cristallisation" du prix et des informations de l'article au moment de la commande.
        const articleData = item.articleId.fournisseurs.find(
          (f) => f.fournisseurId._id?.toString() === fournisseurId || f.fournisseurId.toString() === fournisseurId
        );
        if (!articleData) continue; // Sécurité pour ignorer un article mal configuré.

        const prix = articleData.prixUnitaire;
        const quantiteParConditionnement = articleData.quantiteParConditionnement || 1;
        // Calculate: unit price × units per conditioning × quantity of conditionings ordered
        const prixTotalLigne = prix * quantiteParConditionnement * item.quantite;
        montantTotalCommande += prixTotalLigne;

        articlesDeCommande.push({
          articleId: item.articleId._id,
          quantiteCommandee: item.quantite,
          dateSouhaiteeLivraison: item.dateSouhaiteeLivraison,
          prixUnitaire: prix,
          uniteConditionnement: articleData.uniteConditionnement,
          quantiteParConditionnement: articleData.quantiteParConditionnement,
          referenceFournisseur: articleData.referenceFournisseur,
        });
      }

      // 4. Création du document Commande.
      const nouvelleCommande = await Commande.create({
        numeroCommande: `CMD-${Date.now()}-${fournisseurId.slice(-4)}`,
        fournisseurId: fournisseurId,
        stationId: stationId,
        articles: articlesDeCommande,
        montantTotalHT: montantTotalCommande,
      });
      commandesCreesIds.push(nouvelleCommande._id);
      montantTotalGlobal += montantTotalCommande;
    }

    // 5. Création de la Commande Globale qui chapeaute les commandes fournisseurs.
    const commandeGlobale = await CommandeGlobale.create({
      referenceGlobale: `CG-${Date.now()}`,
      stationId: stationId,
      listeAchatId: listeAchat._id,
      commandesFournisseurs: commandesCreesIds,
      montantTotalHT: montantTotalGlobal,
      creeParId: req.user._id,
    });

    // 6. Liaison des commandes individuelles à la commande globale.
    await Commande.updateMany(
      { _id: { $in: commandesCreesIds } },
      { commandeGlobaleId: commandeGlobale._id }
    );

    // 7. Passage de la liste d'achat au statut 'Traitée'.
    listeAchat.statut = "Traitée";
    listeAchat.commandeGlobaleId = commandeGlobale._id;
    await listeAchat.save();

    res.status(201).json({
      message: "Commandes créées avec succès",
      commandeGlobaleId: commandeGlobale._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un article d'une liste d'achat 'Brouillon'.
 * @function removeItemFromListeAchat
 * @memberof module:controllers/listeAchatController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.itemId - ID de l'article à supprimer
 * @param {Object} req.user - Utilisateur connecté (ajouté par le middleware auth)
 * @param {string} req.user.entiteId - ID de la station
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la liste d'achat mise à jour
 * @throws {NotFoundError} Si la liste d'achat n'est pas trouvée
 * @since 1.0.0
 * @example
 * // DELETE /api/listes-achat/items/64f5a1b2c3d4e5f6a7b8c9d0
 * // Response: { "_id": "...", "articles": [...] }
 */
exports.removeItemFromListeAchat = async (req, res, next) => {
  try {
    const stationId = req.user.entiteId;
    const { itemId } = req.params;

    // Recherche et mise à jour atomique pour retirer l'article.
    const listeAchat = await ListeAchat.findOneAndUpdate(
      { stationId, statut: "Brouillon" },
      { $pull: { articles: { _id: itemId } } },
      { new: true }
    );

    if (!listeAchat) {
      return next(new NotFoundError("Liste d'achat non trouvée."));
    }
    res.json(listeAchat);
  } catch (error) {
    next(error);
  }
};

