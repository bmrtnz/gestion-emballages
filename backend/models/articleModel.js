// backend/models/articleModel.js
const mongoose = require('mongoose');

const fournisseurInfoSchema = new mongoose.Schema({
    fournisseurId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fournisseur',
        required: true,
    },
    referenceFournisseur: String,
    prixUnitaire: { type: Number, required: true },
    uniteConditionnement: String,
    quantiteParConditionnement: Number,
    documents: [
      {
        nomDocument: String,
        typeDocument: String,
        urlStockage: String, // Clé MinIO
        dateExpiration: Date
      }
    ]
});

const articleSchema = new mongoose.Schema({
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
    categorie: String,
    isActive: { type: Boolean, default: true },
    fournisseurs: [fournisseurInfoSchema],
}, { timestamps: true });

const Article = mongoose.model('Article', articleSchema);
module.exports = Article;