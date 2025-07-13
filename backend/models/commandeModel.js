const mongoose = require("mongoose");

// Schéma pour les lignes d'articles dans une commande
const articleCommandeSchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Article",
    required: true,
  },
  referenceFournisseur: String,
  quantiteCommandee: { type: Number, required: true },
  quantiteRecue: { type: Number, default: 0 },
  dateSouhaiteeLivraison: Date,
  dateLivraisonConfirmee: Date,
  prixUnitaire: { type: Number, required: true },
  uniteConditionnement: String,
  quantiteParConditionnement: Number,
});

// Schéma pour l'historique des statuts
const historiqueStatutSchema = new mongoose.Schema({
  statut: String,
  date: { type: Date, default: Date.now },
  parUtilisateurId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

// Schéma pour les non-conformités
const nonConformiteSchema = new mongoose.Schema({
  referenceNC: { type: String, required: true },
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: "Article" },
  type: String,
  description: String,
  photosUrl: [String],
});

const commandeSchema = new mongoose.Schema(
  {
    numeroCommande: { type: String, required: true, unique: true },
    commandeGlobaleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommandeGlobale",
    },
    fournisseurId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fournisseur",
      required: true,
    },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },
    articles: [articleCommandeSchema],
    montantTotalHT: { type: Number, required: true },
    statut: {
      type: String,
      enum: [
        "Enregistrée",
        "Confirmée",
        "Expédiée",
        "Réceptionnée",
        "Clôturée",
        "Facturée",
        "Archivée",
      ],
      default: "Enregistrée",
    },
    historiqueStatuts: [historiqueStatutSchema],
    informationsExpedition: {
      dateExpedition: Date,
      transporteur: String,
      numeroSuivi: String,
      bonLivraisonUrl: String,
    },
    informationsReception: {
      dateReception: Date,
      bonLivraisonEmargeUrl: String,
    },
    nonConformitesReception: [nonConformiteSchema],
    nonConformitesPosterieures: [nonConformiteSchema],
  },
  { timestamps: true }
);

const Commande = mongoose.model("Commande", commandeSchema);
module.exports = Commande;
