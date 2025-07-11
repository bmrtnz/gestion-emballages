// backend/controllers/userController.js
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Créer un nouvel utilisateur
// @route   POST /api/users
// @access  Public (pour l'instant)
exports.createUser = async (req, res) => {
    const { email, password, role, nomComplet, entiteId } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
        }

        const user = await User.create({
            email,
            password,
            role,
            nomComplet,
            entiteId
        });

        if (user) {
            // Ne pas renvoyer le mot de passe haché
            const userResponse = {
                _id: user._id,
                email: user.email,
                role: user.role,
                nomComplet: user.nomComplet,
                entiteId: user.entiteId,
                createdAt: user.createdAt,
            };
            res.status(201).json(userResponse);
        } else {
            res.status(400).json({ message: 'Données invalides' });
        }
    } catch (error) {
        res.status(500).json({ message: `Erreur du serveur: ${error.message}` });
    }
};

// @desc    Authentifier un utilisateur & obtenir un token
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        // Vérifie si l'utilisateur existe ET si le mot de passe correspond
        if (user && (await bcrypt.compare(password, user.password))) {
            // Génère le token
            const token = jwt.sign(
                { id: user._id, role: user.role }, // Payload du token
                process.env.JWT_SECRET,            // Clé secrète
                { expiresIn: '1d' }                // Expiration (1 jour)
            );

            res.json({
                _id: user._id,
                nomComplet: user.nomComplet,
                email: user.email,
                role: user.role,
                token: token,
            });
        } else {
            res.status(401).json({ message: 'Email ou mot de passe invalide' });
        }
    } catch (error) {
        res.status(500).json({ message: `Erreur du serveur: ${error.message}` });
    }
};

// @desc    Obtenir le profil de l'utilisateur connecté
// @route   GET /api/users/profile
// @access  Privé
exports.getUserProfile = async (req, res) => {
    // req.user est disponible grâce à notre middleware 'protect'
    if (req.user) {
        res.json(req.user);
    } else {
        res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
};