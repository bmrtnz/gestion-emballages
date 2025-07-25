/**
 * @fileoverview Contrôleur pour la gestion des utilisateurs
 * @module controllers/userController
 * @requires models/userModel
 * @requires bcryptjs
 * @requires jsonwebtoken
 * @requires utils/appError
 * @requires config/env
 * @author Gestion Emballages Team
 * @since 1.0.0
 */

// backend/controllers/userController.js
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Removed asyncHandler for cleaner testing and error handling
const { BadRequestError, UnauthorizedError, ValidationError, NotFoundError } = require('../utils/appError');
const config = require('../config/env');
const { USER_ROLES } = require('../utils/constants');

/**
 * Créer un nouvel utilisateur.
 * @function createUser
 * @memberof module:controllers/userController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.email - Email de l'utilisateur
 * @param {string} req.body.password - Mot de passe de l'utilisateur
 * @param {string} req.body.role - Rôle de l'utilisateur (Manager, Gestionnaire, Station, Fournisseur)
 * @param {string} req.body.nomComplet - Nom complet de l'utilisateur
 * @param {string} [req.body.entiteId] - ID de l'entité associée (station ou fournisseur)
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie les données de l'utilisateur créé avec le statut 201
 * @throws {ValidationError} Si les champs requis sont manquants ou invalides
 * @throws {BadRequestError} Si l'utilisateur existe déjà
 * @since 1.0.0
 * @example
 * // POST /api/users
 * // Body: { "email": "user@example.com", "password": "password123", "role": "Station", "nomComplet": "John Doe" }
 * // Response: { "_id": "...", "email": "user@example.com", "nomComplet": "John Doe", "role": "Station", "createdAt": "..." }
 */
exports.createUser = async (req, res, next) => {
    try {
    const { email, password, role, nomComplet, entiteId } = req.body;

    // Validation des champs requis
    if (!email || !password || !role || !nomComplet) {
        return next(new ValidationError('Email, mot de passe, rôle et nom complet sont requis'));
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return next(new ValidationError('Veuillez fournir un email valide'));
    }

    // Validation du mot de passe
    if (password.length < 6) {
        return next(new ValidationError('Le mot de passe doit contenir au moins 6 caractères'));
    }

    // Validation du rôle
    if (!USER_ROLES.includes(role)) {
        return next(new ValidationError('Rôle invalide'));
    }

    // Validation de l'entiteId pour les rôles Station et Fournisseur
    if ((role === 'Station' || role === 'Fournisseur') && !entiteId) {
        return next(new ValidationError('L\'entité associée est requise pour ce rôle'));
    }

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
    } catch (error) {
        next(error);
    }
};

/**
 * Authentifier un utilisateur et retourner un token JWT.
 * @function loginUser
 * @memberof module:controllers/userController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.email - Email de l'utilisateur
 * @param {string} req.body.password - Mot de passe de l'utilisateur
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie les données de l'utilisateur avec le token JWT
 * @throws {ValidationError} Si l'email ou le mot de passe sont manquants
 * @throws {UnauthorizedError} Si les identifiants sont incorrects ou le compte est désactivé
 * @since 1.0.0
 * @example
 * // POST /api/users/login
 * // Body: { "email": "user@example.com", "password": "password123" }
 * // Response: { "_id": "...", "email": "user@example.com", "nomComplet": "John Doe", "role": "Station", "token": "jwt_token_here" }
 */
exports.loginUser = async (req, res, next) => {
    try {
    const { email, password } = req.body;

    // Validation des champs requis
    if (!email || !password) {
        return next(new ValidationError('Email et mot de passe sont requis'));
    }

    // Recherche l'utilisateur par email.
    const user = await User.findOne({ email });

    // Vérifier si l'utilisateur est actif
    if (user && !user.isActive) {
        return next(new UnauthorizedError('Compte désactivé'));
    }

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
    } catch (error) {
        next(error);
    }
};

/**
 * Obtenir le profil de l'utilisateur actuellement connecté.
 * @function getUserProfile
 * @memberof module:controllers/userController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.user - Utilisateur connecté (ajouté par le middleware auth)
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie les données de l'utilisateur connecté
 * @since 1.0.0
 * @example
 * // GET /api/users/profile
 * // Headers: { "Authorization": "Bearer jwt_token_here" }
 * // Response: { "_id": "...", "email": "user@example.com", "nomComplet": "John Doe", "role": "Station" }
 */
exports.getUserProfile = async (req, res, next) => {
    try {
    // Start with the user data from the protect middleware
    let userData = req.user.toObject();
    
    // For supplier and station users, populate entity details
    if (userData.entiteId && (userData.role === 'Fournisseur' || userData.role === 'Station')) {
        let EntityModel;
        if (userData.role === 'Fournisseur') {
            EntityModel = require('../models/fournisseurModel');
        } else if (userData.role === 'Station') {
            EntityModel = require('../models/stationModel');
        }
        
        if (EntityModel) {
            const entity = await EntityModel.findById(userData.entiteId);
            if (entity) {
                userData.entiteDetails = entity.toObject();
            }
        }
    }
    
    res.json(userData);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtenir tous les utilisateurs avec pagination, recherche et filtres.
 * @function getUsers
 * @memberof module:controllers/userController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.pagination - Paramètres de pagination ajoutés par le middleware
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie la liste paginée des utilisateurs avec métadonnées
 * @since 1.0.0
 * @example
 * // GET /api/users?page=2&limit=20&search=thomas&role=Station&showInactive=false
 * // Recherche par nom complet, email ou nom d'entité (station/fournisseur)
 * // Response: { data: [...], pagination: { currentPage: 2, totalPages: 3, ... }, filters: { search: 'thomas', ... } }
 */
exports.getUsers = async (req, res, next) => {
    try {
        const { page, limit, skip, search, sortBy, sortOrder, filters } = req.pagination;
        
        // Construction de la query de base
        let query = {};
        
        // Gestion du filtre de statut
        if (filters.status === 'active') {
            query.isActive = true;
        } else if (filters.status === 'inactive') {
            query.isActive = false;
        }
        // Si status est vide ou 'tout', on ne filtre pas sur isActive
        
        // Ajout du filtre par rôle
        if (filters.role) {
            query.role = filters.role;
        }
        
        let users;
        let totalCount;
        
        // Si une recherche est effectuée, nous devons chercher aussi dans les noms d'entités
        if (search) {
            // Recherche dans les stations
            const Station = require('../models/stationModel');
            const matchingStations = await Station.find({ 
                nom: { $regex: search, $options: 'i' } 
            }).select('_id');
            const stationIds = matchingStations.map(s => s._id);
            
            // Recherche dans les fournisseurs
            const Fournisseur = require('../models/fournisseurModel');
            const matchingFournisseurs = await Fournisseur.find({ 
                nom: { $regex: search, $options: 'i' } 
            }).select('_id');
            const fournisseurIds = matchingFournisseurs.map(f => f._id);
            
            // Construire la query avec recherche dans les entités
            const searchQuery = {
                ...query,
                $or: [
                    { nomComplet: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { entiteId: { $in: [...stationIds, ...fournisseurIds] } }
                ]
            };
            
            users = await User.find(searchQuery)
                .select('_id nomComplet email role isActive entiteId entiteModel')
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(limit)
                .exec();
            
            totalCount = await User.countDocuments(searchQuery);
        } else {
            // Requête standard sans recherche
            users = await User.find(query)
                .select('_id nomComplet email role isActive entiteId entiteModel')
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(limit)
                .exec();
            
            totalCount = await User.countDocuments(query);
        }
        
        // Population manuelle basée sur le rôle
        const populatedUsers = [];
        for (const user of users) {
            let populatedUser = user.toObject();
            
            if (user.entiteId && (user.role === 'Station' || user.role === 'Fournisseur')) {
                let EntityModel;
                if (user.role === 'Station') {
                    EntityModel = require('../models/stationModel');
                } else if (user.role === 'Fournisseur') {
                    EntityModel = require('../models/fournisseurModel');
                }
                
                if (EntityModel) {
                    const entity = await EntityModel.findById(user.entiteId).select('nom isActive');
                    if (entity) {
                        // Conserver l'entiteId original pour la fonctionnalité des formulaires et ajouter les infos d'entité
                        populatedUser.entiteId = {
                            _id: user.entiteId,
                            nom: entity.nom,
                            isActive: entity.isActive
                        };
                    }
                }
            }
            
            populatedUsers.push(populatedUser);
        }
        
        res.json(req.pagination.buildResponse(populatedUsers, totalCount));
    } catch (error) {
        next(error);
    }
};

/**
 * Mettre à jour un utilisateur.
 * @function updateUser
 * @memberof module:controllers/userController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de l'utilisateur à mettre à jour
 * @param {Object} req.body - Corps de la requête
 * @param {string} [req.body.nomComplet] - Nouveau nom complet
 * @param {string} [req.body.telephone] - Nouveau numéro de téléphone
 * @param {string} [req.body.entiteId] - Nouvel ID d'entité associée
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie les données de l'utilisateur mis à jour
 * @throws {NotFoundError} Si l'utilisateur n'est pas trouvé
 * @since 1.0.0
 * @example
 * // PUT /api/users/64f5a1b2c3d4e5f6a7b8c9d0
 * // Body: { "nomComplet": "Nouveau Nom", "telephone": "0123456789" }
 * // Response: { "_id": "...", "nomComplet": "Nouveau Nom", "telephone": "0123456789", ... }
 */
exports.updateUser = async (req, res, next) => {
    try {
    const { nomComplet, email, role, telephone, entiteId } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
        return next(new NotFoundError('Utilisateur non trouvé'));
    }
    
    // Check if email is being changed and if it's already taken by another user
    if (email && email !== user.email) {
        const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
        if (existingUser) {
            return next(new BadRequestError('Cet email est déjà utilisé par un autre utilisateur'));
        }
        user.email = email;
    }
    
    if (nomComplet !== undefined) user.nomComplet = nomComplet;
    if (role !== undefined) {
        // Validation de l'entiteId pour les rôles Station et Fournisseur
        if ((role === 'Station' || role === 'Fournisseur') && !entiteId) {
            return next(new ValidationError('L\'entité associée est requise pour ce rôle'));
        }
        user.role = role;
    }
    if (telephone !== undefined) user.telephone = telephone;
    if (entiteId !== undefined) user.entiteId = entiteId;
    
    await user.save();
    
    const updatedUser = await User.findById(req.params.id).select('-password');
    res.json(updatedUser);
    } catch (error) {
        next(error);
    }
};

/**
 * Désactiver un utilisateur (suppression logique).
 * @function deactivateUser
 * @memberof module:controllers/userController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de l'utilisateur à désactiver
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie un message de confirmation
 * @throws {NotFoundError} Si l'utilisateur n'est pas trouvé
 * @since 1.0.0
 * @example
 * // DELETE /api/users/64f5a1b2c3d4e5f6a7b8c9d0
 * // Response: { "message": "Utilisateur désactivé avec succès" }
 */
exports.deactivateUser = async (req, res, next) => {
    try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
        return next(new NotFoundError('Utilisateur non trouvé'));
    }
    
    user.isActive = false;
    await user.save();
    
    res.json({ message: 'Utilisateur désactivé avec succès' });
    } catch (error) {
        next(error);
    }
};

/**
 * Réactiver un utilisateur.
 * @function reactivateUser
 * @memberof module:controllers/userController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.params - Paramètres de la route
 * @param {string} req.params.id - ID de l'utilisateur à réactiver
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie un message de confirmation
 * @throws {NotFoundError} Si l'utilisateur n'est pas trouvé
 * @since 1.0.0
 * @example
 * // PATCH /api/users/64f5a1b2c3d4e5f6a7b8c9d0/reactivate
 * // Response: { "message": "Utilisateur réactivé avec succès" }
 */
exports.reactivateUser = async (req, res, next) => {
    try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
        return next(new NotFoundError('Utilisateur non trouvé'));
    }
    
    user.isActive = true;
    await user.save();
    
    res.json({ message: 'Utilisateur réactivé avec succès' });
    } catch (error) {
        next(error);
    }
};
