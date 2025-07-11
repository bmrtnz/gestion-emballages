// backend/controllers/articleController.js
const Article = require("../models/articleModel");

// @desc    Créer un nouvel article (coquille vide)
exports.createArticle = async (req, res) => {
  try {
    const { codeArticle, designation, categorie } = req.body;
    const article = await Article.create({
      codeArticle,
      designation,
      categorie,
    });
    res.status(201).json(article);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur de création", error: error.message });
  }
};

// @desc    Obtenir tous les articles
exports.getArticles = async (req, res) => {
  try {
    // .populate() remplace l'ID du fournisseur par ses informations (ici, juste le nom)
    // C'est très puissant pour le frontend !
    const articles = await Article.find({ isActive: true }).populate(
      "fournisseurs.fournisseurId",
      "nom"
    );
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// @desc    Ajouter ou mettre à jour un fournisseur pour un article
// @route   POST /api/articles/:id/fournisseurs
exports.addOrUpdateFournisseurForArticle = async (req, res) => {
  try {
    const {
      fournisseurId,
      prixUnitaire,
      referenceFournisseur,
      uniteConditionnement,
      quantiteParConditionnement,
    } = req.body;
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Article non trouvé" });
    }

    const existingFournisseur = article.fournisseurs.find(
      (f) => f.fournisseurId.toString() === fournisseurId
    );

    if (existingFournisseur) {
      // Mettre à jour
      existingFournisseur.prixUnitaire = prixUnitaire;
      // ... autres champs
    } else {
      // Ajouter
      article.fournisseurs.push({
        fournisseurId,
        prixUnitaire,
        referenceFournisseur,
        uniteConditionnement,
        quantiteParConditionnement,
      });
    }

    const updatedArticle = await article.save();

    // On peuple les données avant de les renvoyer au frontend
    await updatedArticle.populate("fournisseurs.fournisseurId", "nom");

    res.json(updatedArticle);
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de l'ajout du fournisseur",
      error: error.message,
    });
  }
};

// @desc    Supprimer un fournisseur d'un article
exports.removeFournisseurFromArticle = async (req, res) => {
  try {
    const { id: articleId, fournisseurInfoId } = req.params;

    // On utilise findByIdAndUpdate avec $pull
    const updatedArticle = await Article.findByIdAndUpdate(
      articleId,
      { $pull: { fournisseurs: { _id: fournisseurInfoId } } },
      { new: true } // 'new: true' renvoie le document après la mise à jour
    );

    if (!updatedArticle) {
      return res.status(404).json({ message: "Article non trouvé" });
    }

    // On peuple également ici
    await updatedArticle.populate("fournisseurs.fournisseurId", "nom");

    res.json(updatedArticle);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Erreur lors de la suppression du lien",
        error: error.message,
      });
  }
};
