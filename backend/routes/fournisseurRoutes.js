// backend/routes/fournisseurRoutes.js
const express = require("express");
const router = express.Router();
const {
  createFournisseur,
  getFournisseurs,
  updateFournisseur,
  deactivateFournisseur,
  reactivateFournisseur,
  addSiteToFournisseur,
  deleteSiteFromFournisseur,
  updateSiteInFournisseur,
  deactivateSite,
  reactivateSite,
} = require("../controllers/fournisseurController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validate } = require('../middleware/validationMiddleware');
const { createFournisseurValidator, addSiteValidator } = require('../validators/fournisseurValidators');

/**
 * @fileoverview Routes pour la gestion des fournisseurs et de leurs sites.
 * @module routes/fournisseurRoutes
 */

/**
 * @swagger
 * tags:
 *   name: Fournisseurs
 *   description: Gestion des fournisseurs et de leurs sites
 */

const managerOnly = [protect, authorize("Manager", "Gestionnaire")];

router.route("/")
  /**
   * @swagger
   * /fournisseurs:
   *   get:
   *     summary: Récupérer la liste des fournisseurs actifs
   *     tags: [Fournisseurs]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Une liste de fournisseurs.
   */
  .get(protect, getFournisseurs)
  /**
   * @swagger
   * /fournisseurs:
   *   post:
   *     summary: Créer un nouveau fournisseur
   *     tags: [Fournisseurs]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Fournisseur'
   *     responses:
   *       201:
   *         description: Fournisseur créé avec succès.
   */
  .post(...managerOnly, createFournisseurValidator, validate, createFournisseur);

router.route("/:id")
  /**
   * @swagger
   * /fournisseurs/{id}:
   *   put:
   *     summary: Mettre à jour un fournisseur
   *     tags: [Fournisseurs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID du fournisseur
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Fournisseur'
   *     responses:
   *       200:
   *         description: Fournisseur mis à jour avec succès.
   */
  .put(...managerOnly, updateFournisseur)
  /**
   * @swagger
   * /fournisseurs/{id}:
   *   delete:
   *     summary: Désactiver un fournisseur (soft delete)
   *     tags: [Fournisseurs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID du fournisseur
   *     responses:
   *       200:
   *         description: Fournisseur désactivé avec succès.
   */
  .delete(...managerOnly, deactivateFournisseur);

router.route("/:id/reactivate")
  /**
   * @swagger
   * /fournisseurs/{id}/reactivate:
   *   patch:
   *     summary: Réactiver un fournisseur
   *     tags: [Fournisseurs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID du fournisseur
   *     responses:
   *       200:
   *         description: Fournisseur réactivé avec succès.
   */
  .patch(...managerOnly, reactivateFournisseur);

// Specific routes first (to avoid route conflicts)
router.route("/:id/sites/:siteId/deactivate")
  /**
   * @swagger
   * /fournisseurs/{id}/sites/{siteId}/deactivate:
   *   patch:
   *     summary: Désactiver un site spécifique
   *     tags: [Fournisseurs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID du fournisseur
   *       - in: path
   *         name: siteId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID du site
   *     responses:
   *       200:
   *         description: Site désactivé avec succès.
   */
  .patch(...managerOnly, deactivateSite);

router.route("/:id/sites/:siteId/reactivate")
  /**
   * @swagger
   * /fournisseurs/{id}/sites/{siteId}/reactivate:
   *   patch:
   *     summary: Réactiver un site spécifique
   *     tags: [Fournisseurs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID du fournisseur
   *       - in: path
   *         name: siteId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID du site
   *     responses:
   *       200:
   *         description: Site réactivé avec succès.
   */
  .patch(...managerOnly, reactivateSite);

router.route("/:id/sites")
  /**
   * @swagger
   * /fournisseurs/{id}/sites:
   *   post:
   *     summary: Ajouter un site à un fournisseur
   *     tags: [Fournisseurs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID du fournisseur
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Site'
   *     responses:
   *       201:
   *         description: Site ajouté avec succès.
   */
  .post(...managerOnly, addSiteValidator, validate, addSiteToFournisseur);

router.route("/:id/sites/:siteId")
  /**
   * @swagger
   * /fournisseurs/{id}/sites/{siteId}:
   *   put:
   *     summary: Mettre à jour un site spécifique
   *     tags: [Fournisseurs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID du fournisseur
   *       - in: path
   *         name: siteId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID du site
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Site'
   *     responses:
   *       200:
   *         description: Site mis à jour avec succès.
   */
  .put(...managerOnly, updateSiteInFournisseur)
  /**
   * @swagger
   * /fournisseurs/{id}/sites/{siteId}:
   *   delete:
   *     summary: Supprimer un site d'un fournisseur
   *     tags: [Fournisseurs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID du fournisseur
   *       - in: path
   *         name: siteId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID du site
   *     responses:
   *       200:
   *         description: Site supprimé avec succès.
   */
  .delete(...managerOnly, deleteSiteFromFournisseur);

module.exports = router;

