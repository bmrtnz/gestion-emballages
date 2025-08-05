// backend/models/articleModel.js
const mongoose = require("mongoose");
const { ARTICLE_CATEGORIES } = require("../utils/constants");

const fournisseurInfoSchema = new mongoose.Schema({
    fournisseurId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Fournisseur",
        required: true,
    },
    referenceFournisseur: String,
    prixUnitaire: { type: Number, required: true },
    uniteConditionnement: String,
    quantiteParConditionnement: Number,
    delaiIndicatifApprovisionnement: { type: Number }, // Délai en jours
    imageUrl: String, // URL de l'image du produit chez ce fournisseur
    documents: [
        {
            nomDocument: String,
            typeDocument: String,
            urlStockage: String, // Clé MinIO
            dateExpiration: Date,
        },
    ],
});

const articleSchema = new mongoose.Schema(
    {
        codeArticle: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        designation: {
            type: String,
            required: true,
            trim: true,
        },
        categorie: {
            type: String,
            enum: ARTICLE_CATEGORIES,
            required: false
        },
        isActive: { type: Boolean, default: true },
        fournisseurs: [fournisseurInfoSchema],
    },
    { timestamps: true }
);

/**
 * Middleware post-find pour auto-peupler les fournisseurs
 * s'exécute après find(), findOne() et findOneAndUpdate().
 */
async function autoPopulateFournisseurs(documents) {
    if (!documents) return;

    // Si plusieurs documents (array) ou un seul
    const docs = Array.isArray(documents) ? documents : [documents];
    await Promise.all(docs.map((doc) => doc.populate("fournisseurs.fournisseurId", "nom")));
}

// Hooks Mongoose
articleSchema.post("find", async function (result) {
    await autoPopulateFournisseurs(result);
});

articleSchema.post("findOne", async function (result) {
    await autoPopulateFournisseurs(result);
});

articleSchema.post("findOneAndUpdate", async function (result) {
    await autoPopulateFournisseurs(result);
});

// Index sur fournisseurs.fournisseurId pour accélérer les recherches
articleSchema.index({ "fournisseurs.fournisseurId": 1 });

module.exports = mongoose.model("Article", articleSchema);
