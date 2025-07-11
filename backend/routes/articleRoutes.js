// backend/routes/articleRoutes.js
const express = require("express");
const router = express.Router();
const {
  createArticle,
  getArticles,
  addOrUpdateFournisseurForArticle,
  removeFournisseurFromArticle,
} = require("../controllers/articleController");
const { protect, authorize } = require("../middleware/authMiddleware");

// La gestion du catalogue article est réservée aux Managers et Gestionnaires
router
  .route("/")
  .post(protect, authorize("Manager", "Gestionnaire"), createArticle)
  .get(protect, getArticles);

router
  .route("/:id/fournisseurs")
  .post(
    protect,
    authorize("Manager", "Gestionnaire"),
    addOrUpdateFournisseurForArticle
  );

router
  .route("/:id/fournisseurs/:fournisseurInfoId")
  .delete(
    protect,
    authorize("Manager", "Gestionnaire"),
    removeFournisseurFromArticle
  );

module.exports = router;
