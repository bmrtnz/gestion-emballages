// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Récupérer le token du header (enlève "Bearer ")
            token = req.headers.authorization.split(' ')[1];

            // 2. Vérifier le token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Récupérer l'utilisateur depuis la BDD et l'attacher à la requête
            // On exclut le mot de passe avec '-password'
            req.user = await User.findById(decoded.id).select('-password');
            
            next(); // Passe au contrôleur suivant
        } catch (error) {
            res.status(401).json({ message: 'Non autorisé, token invalide' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Non autorisé, pas de token' });
    }
};

// Nouveau middleware pour autoriser certains rôles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            // L'utilisateur n'a pas le bon rôle
            return res.status(403).json({ message: 'Accès refusé. Droits insuffisants.' });
        }
        next();
    };
};


module.exports = { protect, authorize };