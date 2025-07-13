// backend/controllers/listeAchatController.js
const ListeAchat = require("../models/listeAchatModel");
const Commande = require("../models/commandeModel");
const CommandeGlobale = require("../models/commandeGlobaleModel");
const Article = require("../models/articleModel");
const { NotFoundError, BadRequestError } = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @description Obtenir la liste d'achat en cours (statut 'Brouillon') pour la station de l'utilisateur.
 * Si elle n'existe pas, la créer.
 * @route GET /api/listes-achat
 * @access Privé (Station)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.getOrCreateListeAchat = asyncHandler(async (req, res, next) => {
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
});

/**
 * @description Ajouter un article à la liste d'achat 'Brouillon' de la station.
 * @route POST /api/listes-achat
 * @access Privé (Station)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.updateItemInListeAchat = asyncHandler(async (req, res, next) => {
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
});

/**
 * @description Valider la liste d'achat, ce qui la transforme en commandes.
 * @route POST /api/listes-achat/validate
 * @access Privé (Station)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.validateListeAchat = asyncHandler(async (req, res, next) => {
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
        (f) => f.fournisseurId.toString() === fournisseurId
      );
      if (!articleData) continue; // Sécurité pour ignorer un article mal configuré.

      const prix = articleData.prixUnitaire;
      montantTotalCommande += prix * item.quantite;

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
});

/**
 * @description Supprimer un article d'une liste d'achat 'Brouillon'.
 * @route DELETE /api/listes-achat/items/:itemId
 * @access Privé (Station)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.removeItemFromListeAchat = asyncHandler(async (req, res, next) => {
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
});

