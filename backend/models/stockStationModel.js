// backend/models/stockStationModel.js
const mongoose = require('mongoose');

const stockStationSchema = new mongoose.Schema({
    stationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station',
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
}, { timestamps: true }); // Ajoute createdAt automatiquement

const StockStation = mongoose.model('StockStation', stockStationSchema);
module.exports = StockStation;