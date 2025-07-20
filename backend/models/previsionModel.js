// backend/models/previsionModel.js
const mongoose = require('mongoose');

// Schéma pour représenter une semaine
const semaineSchema = new mongoose.Schema({
    numeroSemaine: {
        type: Number,
        required: true,
        min: 1,
        max: 52,
    },
    quantitePrevue: {
        type: Number,
        default: 0,
        min: 0,
    },
});

// Schéma pour représenter une prévision d'article avec ses semaines
const articlePrevisionSchema = new mongoose.Schema({
    articleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article",
        required: true,
    },
    semaines: [semaineSchema],
});

// Schéma principal pour les prévisions
const previsionSchema = new mongoose.Schema(
    {
        campagne: {
            type: String,
            required: true,
            match: /^\d{2}-\d{2}$/, // Format: "25-26"
        },
        fournisseurId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Fournisseur",
            required: true,
        },
        siteId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        articlesPrevisions: [articlePrevisionSchema],
    },
    {
        timestamps: true, // Ajoute createdAt et updatedAt automatiquement
    }
);

// Index composé pour éviter les doublons
previsionSchema.index({ campagne: 1, fournisseurId: 1, siteId: 1 }, { unique: true });

// Méthode pour obtenir le total prévisionnel
previsionSchema.methods.getTotalPrevisionnel = function () {
    return this.articlesPrevisions.reduce((total, ap) => {
        return total + ap.semaines.reduce((sum, semaine) => sum + semaine.quantitePrevue, 0);
    }, 0);
};

// Méthode pour obtenir le total prévisionnel d'un article spécifique
previsionSchema.methods.getTotalArticle = function (articleId) {
    const articlePrevision = this.articlesPrevisions.find(
        ap => ap.articleId.toString() === articleId.toString()
    );
    if (!articlePrevision) return 0;
    return articlePrevision.semaines.reduce((sum, semaine) => sum + semaine.quantitePrevue, 0);
};

const Prevision = mongoose.model('Prevision', previsionSchema);
module.exports = Prevision;