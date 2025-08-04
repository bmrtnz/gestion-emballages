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
    specialisation: String, // Ajout du champ spécialisation
    sites: [siteSchema],
    documents: [documentSchema],
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

/**
 * Hook pre-save pour gérer la désactivation en cascade des sites
 * Quand un fournisseur est désactivé, tous ses sites le sont aussi
 */
fournisseurSchema.pre('save', function(next) {
    // Si le fournisseur est désactivé, désactiver tous ses sites
    if (!this.isActive) {
        this.sites.forEach(site => {
            site.isActive = false;
        });
    }
    next();
});

/**
 * Hook post-save pour gérer la désactivation des utilisateurs liés
 * Quand un fournisseur est désactivé, désactiver l'utilisateur associé
 */
fournisseurSchema.post('save', async function(doc) {
    if (!doc.isActive) {
        const User = require('./userModel');
        await User.updateMany(
            { entiteId: doc._id, role: 'Fournisseur' },
            { isActive: false }
        );
    }
});

/**
 * Hook pre-findOneAndUpdate pour gérer la désactivation en cascade
 * Gère les mises à jour via findOneAndUpdate, updateOne, etc.
 */
fournisseurSchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate();
    
    // Si isActive est défini à false dans la mise à jour
    if (update.isActive === false || (update.$set && update.$set.isActive === false)) {
        // Récupérer le document actuel
        const doc = await this.model.findOne(this.getQuery());
        if (doc) {
            // Désactiver tous les sites
            const updatedSites = doc.sites.map(site => ({
                ...site.toObject(),
                isActive: false
            }));
            
            // Ajouter les sites désactivés à la mise à jour
            if (update.$set) {
                update.$set.sites = updatedSites;
            } else {
                update.sites = updatedSites;
            }
            
            // Désactiver l'utilisateur associé
            const User = require('./userModel');
            await User.updateMany(
                { entiteId: doc._id, role: 'Fournisseur' },
                { isActive: false }
            );
        }
    }
    next();
});

/**
 * Transform function to convert document file keys to full URLs
 */
fournisseurSchema.methods.toJSON = function() {
    const obj = this.toObject();
    
    // Transform document URLs
    if (obj.documents && obj.documents.length > 0) {
        const config = require('../config/env');
        const baseUrl = `${config.minio.useSSL ? 'https' : 'http'}://${config.minio.externalHost}:${config.minio.port}/documents`;
        
        obj.documents = obj.documents.map(doc => ({
            ...doc,
            urlStockage: doc.urlStockage.startsWith('http') ? doc.urlStockage : `${baseUrl}/${doc.urlStockage}`
        }));
    }
    
    return obj;
};

const Fournisseur = mongoose.model('Fournisseur', fournisseurSchema);
module.exports = Fournisseur;