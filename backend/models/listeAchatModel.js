// backend/models/listeAchatModel.js
const mongoose = require('mongoose');

const listeAchatSchema = new mongoose.Schema({
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
    statut: { type: String, enum: ['Brouillon', 'Traitée'], default: 'Brouillon' },
    articles: [
      {
        articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
        fournisseurId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fournisseur', required: true },
        quantite: { type: Number, required: true, min: 1 },
        dateSouhaiteeLivraison: { type: Date, required: true },
        remarques: String
      }
    ],
    commandeGlobaleId: { type: mongoose.Schema.Types.ObjectId, ref: 'CommandeGlobale' },
    creeParId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const ListeAchat = mongoose.model('ListeAchat', listeAchatSchema);
module.exports = ListeAchat;