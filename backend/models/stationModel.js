// backend/models/stationModel.js
const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    identifiantInterne: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    // Le groupe sera ajouté dans une étape ultérieure
    // groupeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Groupe' },
    adresse: {
        rue: String,
        codePostal: String,
        ville: String,
        pays: String,
    },
    contactPrincipal: {
        nom: String,
        email: String,
        telephone: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const Station = mongoose.model('Station', stationSchema);
module.exports = Station;