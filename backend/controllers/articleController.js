// backend/controllers/articleController.js
const Article = require("../models/articleModel");
const { NotFoundError } = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @description Créer un nouvel article.
 * @route POST /api/articles
 * @access Privé (Manager, Gestionnaire)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.createArticle = asyncHandler(async (req, res, next) => {
  // Extraction des données du corps de la requête.
  const { codeArticle, designation, categorie } = req.body;
  
  // Création de l'article dans la base de données.
  const article = await Article.create({
    codeArticle,
    designation,
    categorie,
  });
  
  // Envoi de la réponse avec le nouvel article et le statut 201 (Créé).
  res.status(201).json(article);
});

/**
 * @description Obtenir tous les articles actifs.
 * @route GET /api/articles
 * @access Privé
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.getArticles = asyncHandler(async (req, res, next) => {
  // Recherche de tous les articles marqués comme actifs.
  // La méthode .populate() est utilisée pour remplacer les IDs des fournisseurs
  // par leurs informations complètes (ici, uniquement le nom), ce qui est très
  // utile pour l'affichage côté client.
  const articles = await Article.find({ isActive: true }).populate(
    "fournisseurs.fournisseurId",
    "nom"
  );
  
  // Envoi de la liste des articles en réponse.
  res.json(articles);
});

/**
 * @description Ajouter ou mettre à jour les informations d'un fournisseur pour un article spécifique.
 * @route POST /api/articles/:id/fournisseurs
 * @access Privé (Manager, Gestionnaire)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.addOrUpdateFournisseurForArticle = asyncHandler(async (req, res, next) => {
  // Extraction des données du fournisseur depuis le corps de la requête.
  const {
    fournisseurId,
    prixUnitaire,
    referenceFournisseur,
    uniteConditionnement,
    quantiteParConditionnement,
  } = req.body;
  
  // Recherche de l'article par son ID.
  const article = await Article.findById(req.params.id);

  // Si l'article n'est pas trouvé, une erreur 404 est levée.
  if (!article) {
    return next(new NotFoundError("Article non trouvé"));
  }

  // Vérification si le fournisseur existe déjà pour cet article.
  const existingFournisseur = article.fournisseurs.find(
    (f) => f.fournisseurId.toString() === fournisseurId
  );

  if (existingFournisseur) {
    // Si le fournisseur existe, mise à jour de ses informations.
    existingFournisseur.prixUnitaire = prixUnitaire;
    // D'autres champs pourraient être mis à jour ici.
  } else {
    // Sinon, ajout du nouveau fournisseur à la liste des fournisseurs de l'article.
    article.fournisseurs.push({
      fournisseurId,
      prixUnitaire,
      referenceFournisseur,
      uniteConditionnement,
      quantiteParConditionnement,
    });
  }

  // Sauvegarde de l'article mis à jour.
  const updatedArticle = await article.save();

  // "Peuplement" des données du fournisseur avant de les renvoyer, pour que le frontend
  // reçoive le nom du fournisseur et pas seulement son ID.
  await updatedArticle.populate("fournisseurs.fournisseurId", "nom");

  // Envoi de l'article mis à jour en réponse.
  res.json(updatedArticle);
});

/**
 * @description Supprimer le lien entre un fournisseur et un article.
 * @route DELETE /api/articles/:id/fournisseurs/:fournisseurInfoId
 * @access Privé (Manager, Gestionnaire)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.removeFournisseurFromArticle = asyncHandler(async (req, res, next) => {
  // Extraction de l'ID de l'article et de l'ID de l'information fournisseur.
  const { id: articleId, fournisseurInfoId } = req.params;

  // Utilisation de findByIdAndUpdate avec l'opérateur $pull pour retirer
  // l'objet correspondant du tableau 'fournisseurs'.
  const updatedArticle = await Article.findByIdAndUpdate(
    articleId,
    { $pull: { fournisseurs: { _id: fournisseurInfoId } } },
    { new: true } // 'new: true' assure que le document retourné est la version mise à jour.
  );

  // Si l'article n'est pas trouvé, une erreur 404 est levée.
  if (!updatedArticle) {
    return next(new NotFoundError("Article non trouvé"));
  }

  // Peuplement des données du fournisseur pour la réponse.
  await updatedArticle.populate("fournisseurs.fournisseurId", "nom");

  // Envoi de l'article mis à jour.
  res.json(updatedArticle);
});

/**
 * @description Mettre à jour les informations d'un fournisseur pour un article.
 * @route PUT /api/articles/:id/fournisseurs/:fournisseurInfoId
 * @access Privé (Manager, Gestionnaire)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.updateFournisseurForArticle = asyncHandler(async (req, res, next) => {
  // Extraction des IDs et des données à mettre à jour.
  const { id: articleId, fournisseurInfoId } = req.params;
  const { prixUnitaire, referenceFournisseur } = req.body;

  // Recherche de l'article parent.
  const article = await Article.findById(articleId);

  if (!article) {
    return next(new NotFoundError('Article non trouvé'));
  }

  // Recherche du sous-document fournisseur par son ID.
  const fournisseurInfo = article.fournisseurs.id(fournisseurInfoId);

  if (!fournisseurInfo) {
    return next(new NotFoundError('Lien fournisseur non trouvé'));
  }

  // Mise à jour des champs.
  fournisseurInfo.prixUnitaire = prixUnitaire;
  fournisseurInfo.referenceFournisseur = referenceFournisseur;

  // Sauvegarde de l'article parent pour appliquer les modifications.
  const updatedArticle = await article.save();
  
  // Peuplement des données pour la réponse.
  await updatedArticle.populate('fournisseurs.fournisseurId', 'nom');

  // Envoi de l'article mis à jour.
  res.json(updatedArticle);
});
