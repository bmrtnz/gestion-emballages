// backend/controllers/userController.js
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { BadRequestError, UnauthorizedError } = require('../utils/appError');
const config = require('../config/env');

/**
 * @description Créer un nouvel utilisateur.
 * @route POST /api/users
 * @access Public (devrait être restreint en production)
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.createUser = asyncHandler(async (req, res, next) => {
    const { email, password, role, nomComplet, entiteId } = req.body;

    // Vérifie si un utilisateur avec cet email existe déjà.
    const userExists = await User.findOne({ email });
    if (userExists) {
        return next(new BadRequestError('Cet utilisateur existe déjà'));
    }

    // Crée l'utilisateur. Le mot de passe est haché automatiquement par un hook pre-save dans le modèle.
    const user = await User.create({
        email,
        password,
        role,
        nomComplet,
        entiteId
    });

    // Prépare la réponse en excluant le mot de passe.
    const userResponse = {
        _id: user._id,
        email: user.email,
        role: user.role,
        nomComplet: user.nomComplet,
        entiteId: user.entiteId,
        createdAt: user.createdAt,
    };
    res.status(201).json(userResponse);
});

/**
 * @description Authentifier un utilisateur et retourner un token JWT.
 * @route POST /api/users/login
 * @access Public
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Recherche l'utilisateur par email.
    const user = await User.findOne({ email });

    // Vérifie si l'utilisateur existe et si le mot de passe fourni correspond au mot de passe haché.
    if (user && (await bcrypt.compare(password, user.password))) {
        // Génère le token JWT avec les informations essentielles de l'utilisateur.
        const token = jwt.sign(
            { id: user._id, role: user.role, entiteId: user.entiteId }, // Payload
            config.jwtSecret, // Clé secrète
            { expiresIn: '1d' } // Durée de validité
        );

        // Renvoie les informations de l'utilisateur et le token.
        res.json({
            _id: user._id,
            nomComplet: user.nomComplet,
            email: user.email,
            role: user.role,
            entiteId: user.entiteId,
            token: token,
        });
    } else {
        // Si l'authentification échoue, lever une erreur 401.
        return next(new UnauthorizedError('Email ou mot de passe invalide'));
    }
});

/**
 * @description Obtenir le profil de l'utilisateur actuellement connecté.
 * @route GET /api/users/profile
 * @access Privé
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.getUserProfile = asyncHandler(async (req, res, next) => {
    // Les informations de l'utilisateur sont déjà attachées à l'objet `req`
    // par le middleware `protect`. Il suffit de les renvoyer.
    res.json(req.user);
});
