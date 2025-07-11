// backend/models/commandeModel.js
const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema({
    numeroCommande: { type: String, required: true, unique: true },
    commandeGlobaleId: { type: mongoose.Schema.Types.ObjectId, ref: 'CommandeGlobale' },
    fournisseurId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fournisseur', required: true },
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
    articles: [
      {
        articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
        quantiteCommandee: { type: Number, required: true },
        quantiteRecue: { type: Number, default: 0 },
        dateSouhaiteeLivraison: Date,
        dateLivraisonConfirmee: Date,
        prixUnitaire: { type: Number, required: true },
        uniteConditionnement: String,
        quantiteParConditionnement: Number
      }
    ],
    montantTotalHT: { type: Number, required: true },
    statut: {
        type: String,
        // On liste ici TOUS les statuts possibles
        enum: ['Enregistrée', 'Confirmée', 'Expédiée', 'Réceptionnée', 'Clôturée', 'Facturée', 'Archivée'],
        default: 'Enregistrée'
    },
    historiqueStatuts: [ /* ... */ ],
}, { timestamps: true });

const Commande = mongoose.model('Commande', commandeSchema);
module.exports = Commande;