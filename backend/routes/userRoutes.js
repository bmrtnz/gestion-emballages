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

module.exports = router;
