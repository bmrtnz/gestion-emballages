// backend/models/demandeTransfertModel.js
const mongoose = require('mongoose');

const demandeTransfertSchema = new mongoose.Schema({
    referenceTransfert: { type: String, required: true, unique: true },
    stationDestinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true }, // Qui demande
    stationSourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },      // Qui fournit
    articles: [
      {
        articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
        quantiteDemandee: { type: Number, required: true },
        quantiteConfirmee: Number,
        quantiteRecue: Number
      }
    ],
    statut: {
        type: String,
        enum: ['Enregistrée', 'Confirmée', 'Rejetée', 'Traitée logistique', 'Expédiée', 'Réceptionnée', 'Clôturée', 'Traitée comptabilité', 'Archivée'],
        default: 'Enregistrée'
    },
    historiqueStatuts: [
      {
        statut: String,
        date: Date,
        parUtilisateurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    ],
    motifRejet: String,
    informationsExpedition: {
      dateExpedition: Date,
      bonLivraisonUrl: String
    },
    informationsReception: {
      dateReception: Date,
      bonLivraisonEmargeUrl: String
    },
    creeParId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const DemandeTransfert = mongoose.model('DemandeTransfert', demandeTransfertSchema);
module.exports = DemandeTransfert;