// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUser,
  getUserProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   - name: Utilisateurs
 *     description: Authentification et gestion des utilisateurs
 */

router.post("/", createUser);

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
router.post("/login", loginUser);

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
router.get("/profile", protect, getUserProfile);

module.exports = router;
