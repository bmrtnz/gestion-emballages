// backend/models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['Manager', 'Gestionnaire', 'Station', 'Fournisseur'],
    },
    nomComplet: {
        type: String,
        required: true,
    },
    telephone: String,
    entiteId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'entiteModel', // Référence dynamique au modèle Station ou Fournisseur
    },
    entiteModel: {
        type: String,
        enum: ['Station', 'Fournisseur']
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true }); // Ajoute createdAt et updatedAt

// Hacher le mot de passe avant de sauvegarder le document
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Middleware pour définir entiteModel en fonction du rôle
userSchema.pre('save', function(next) {
    if (this.role === 'Station' || this.role === 'Fournisseur') {
        this.entiteModel = this.role;
    }
    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;