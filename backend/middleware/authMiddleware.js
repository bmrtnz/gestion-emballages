// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const asyncHandler = require('../utils/asyncHandler');
const { UnauthorizedError, ForbiddenError } = require('../utils/appError');
const config = require('../config/env');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // 1. Récupérer le token du header (enlève "Bearer ")
        token = req.headers.authorization.split(' ')[1];

        // 2. Vérifier le token
        const decoded = jwt.verify(token, config.jwtSecret);

        // 3. Récupérer l'utilisateur depuis la BDD et l'attacher à la requête
        // On exclut le mot de passe avec '-password'
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return next(new UnauthorizedError('L\'utilisateur appartenant à ce token n\'existe plus.'));
        }
        
        next(); // Passe au contrôleur suivant
    }

    if (!token) {
        return next(new UnauthorizedError('Non autorisé, pas de token'));
    }
});

// Nouveau middleware pour autoriser certains rôles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            // L'utilisateur n'a pas le bon rôle
            return next(new ForbiddenError('Accès refusé. Droits insuffisants.'));
        }
        next();
    };
};


module.exports = { protect, authorize };