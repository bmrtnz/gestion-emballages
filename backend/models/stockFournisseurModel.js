// backend/models/stockFournisseurModel.js
const mongoose = require('mongoose');

const stockFournisseurSchema = new mongoose.Schema({
    fournisseurId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fournisseur',
        required: true,
    },
    siteId: { // Référence à l'ID du site dans le document Fournisseur
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    articleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true,
    },
    quantite: {
        type: Number,
        required: true,
    },
    dateInventaire: {
        type: Date,
        required: true,
    },
    creeParId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

const StockFournisseur = mongoose.model('StockFournisseur', stockFournisseurSchema);
module.exports = StockFournisseur;