// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
    createUser,
    loginUser,
    getUserProfile,
    getUsers,
    updateUser,
    deactivateUser,
    reactivateUser,
    sendPasswordResetLink,
    resetPassword,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const paginationMiddleware = require("../middleware/paginationMiddleware");
const {
    createUserValidator,
    loginUserValidator,
} = require("../validators/userValidators");
const { validate } = require("../middleware/validationMiddleware");

/**
 * @fileoverview Ce fichier définit les routes pour l'authentification et la gestion des utilisateurs.
 * @module routes/userRoutes
 */

/**
 * @swagger
 * tags:
 *   - name: Utilisateurs
 *     description: Authentification et gestion des utilisateurs
 */

// Route pour créer un nouvel utilisateur.
router.post("/", createUserValidator, validate, createUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Connecte un utilisateur et retourne un token JWT
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@station.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Connexion réussie, token retourné.
 *       401:
 *         description: Email ou mot de passe invalide.
 */
// Route pour l'authentification des utilisateurs.
router.post("/login", loginUserValidator, validate, loginUser);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Retourne le profil de l'utilisateur connecté
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil de l'utilisateur.
 *       401:
 *         description: Non autorisé.
 */
// Route pour obtenir le profil de l'utilisateur actuellement connecté.
router.get("/profile", protect, getUserProfile);

// Route pour obtenir tous les utilisateurs (protection avec authentification).
router.get("/", protect, paginationMiddleware, getUsers);

// Route pour mettre à jour un utilisateur.
router.put("/:id", protect, updateUser);

// Route pour désactiver un utilisateur (suppression logique).
router.delete("/:id", protect, deactivateUser);

// Route pour réactiver un utilisateur.
router.patch("/:id/reactivate", protect, reactivateUser);

/**
 * @swagger
 * /users/password-reset-link:
 *   post:
 *     summary: Envoie un lien de réinitialisation de mot de passe par email
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Lien de réinitialisation envoyé (même si l'utilisateur n'existe pas pour des raisons de sécurité)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lien de réinitialisation envoyé à user@example.com"
 *       400:
 *         description: Email manquant ou invalide
 */
// Route pour envoyer un lien de réinitialisation de mot de passe (pas de protection nécessaire).
router.post("/password-reset-link", sendPasswordResetLink);

/**
 * @swagger
 * /users/reset-password:
 *   post:
 *     summary: Réinitialise le mot de passe avec un token valide
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 example: "abc123def456..."
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Mot de passe réinitialisé avec succès"
 *       400:
 *         description: Token invalide, expiré ou mot de passe trop faible
 */
// Route pour réinitialiser le mot de passe (pas de protection nécessaire car le token fait office d'authentification).
router.post("/reset-password", resetPassword);

module.exports = router;
