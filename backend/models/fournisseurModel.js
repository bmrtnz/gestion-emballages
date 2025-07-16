// backend/models/fournisseurModel.js
const mongoose = require('mongoose');

// Schéma pour les documents de certification
const documentSchema = new mongoose.Schema({
    nomDocument: { type: String, required: true },
    typeDocument: String,
    urlStockage: { type: String, required: true }, // Clé MinIO
    dateExpiration: Date,
});

// Schéma pour les sites d'un fournisseur
const siteSchema = new mongoose.Schema({
    // Un _id sera automatiquement ajouté par Mongoose
    nomSite: { type: String, required: true },
    estPrincipal: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    adresse: {
        rue: String,
        codePostal: String,
        ville: String,
        pays: String,
    },
    contact: {
        nom: String,
        email: String,
        telephone: String,
    },
});

const fournisseurSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    siret: String,
    sites: [siteSchema],
    documents: [documentSchema],
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const Fournisseur = mongoose.model('Fournisseur', fournisseurSchema);
module.exports = Fournisseur;