/**
 * @fileoverview Constantes de l'application
 * @module utils/constants
 * @author Gestion Emballages Team
 * @since 1.0.0
 */

/**
 * Catégories d'articles disponibles
 * @constant {string[]}
 */
const ARTICLE_CATEGORIES = [
    'Barquette',
    'Cagette', 
    'Plateau',
    'Film Plastique',
    'Carton',
    'Sac Plastique',
    'Sac Papier',
    'Emballage Isotherme',
    'Etiquette',
    'Autre'
];

/**
 * Rôles d'utilisateur disponibles
 * @constant {string[]}
 */
const USER_ROLES = [
    'Manager',
    'Gestionnaire', 
    'Station',
    'Fournisseur'
];

/**
 * Modèles d'entité pour les utilisateurs
 * @constant {string[]}
 */
const ENTITY_MODELS = [
    'Station',
    'Fournisseur'
];

module.exports = {
    ARTICLE_CATEGORIES,
    USER_ROLES,
    ENTITY_MODELS
};