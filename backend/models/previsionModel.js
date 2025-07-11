// backend/models/previsionModel.js
const mongoose = require('mongoose');

const previsionSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    campagne: { type: String, required: true }, // ex: "25-26"
    fournisseurId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fournisseur', required: true },
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
    previsionsHebdomadaires: [
      {
        annee: { type: Number, required: true },
        numeroSemaine: { type: Number, required: true },
        quantitePrevue: { type: Number, default: 0 },
        dateMiseAJour: { type: Date, default: Date.now }
      }
    ],
    creeParId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// S'assurer que chaque prévision est unique pour un article/fournisseur/campagne
previsionSchema.index({ campagne: 1, fournisseurId: 1, articleId: 1 }, { unique: true });

const Prevision = mongoose.model('Prevision', previsionSchema);
module.exports = Prevision;