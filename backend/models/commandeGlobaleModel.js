// backend/models/commandeGlobaleModel.js
const mongoose = require("mongoose");

const commandeGlobaleSchema = new mongoose.Schema(
  {
    referenceGlobale: { type: String, required: true, unique: true },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },
    listeAchatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ListeAchat",
      required: true,
    },
    commandesFournisseurs: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Commande" },
    ],
    montantTotalHT: { type: Number, required: true },
    statutGeneral: { 
        type: String, 
        default: "Enregistrée",
        enum: [
            'Enregistrée',
            'Partiellement confirmée',
            'Confirmée',
            'Partiellement expédiée',
            'Expédiée',
            'Partiellement réceptionnée',
            'Réceptionnée',
            'Partiellement clôturée',
            'Clôturée',
            'Partiellement facturée',
            'Facturée',
            'Partiellement archivée',
            'Archivée',
            'Vide'
        ]
    },
    creeParId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const CommandeGlobale = mongoose.model(
  "CommandeGlobale",
  commandeGlobaleSchema
);
module.exports = CommandeGlobale;
