// backend/routes/fournisseurRoutes.js
const express = require("express");
const router = express.Router();
const {
  createFournisseur,
  getFournisseurs,
  getFournisseurById,
  updateFournisseur,
  deactivateFournisseur,
  reactivateFournisseur,
  addSiteToFournisseur,
  deleteSiteFromFournisseur,
  updateSiteInFournisseur,
  deactivateSite,
  reactivateSite,
  uploadDocument,
  deleteDocument,
} = require("../controllers/fournisseurController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { validate } = require('../middleware/validationMiddleware');
const paginationMiddleware = require("../middleware/paginationMiddleware");
const { createFournisseurValidator, addSiteValidator } = require('../validators/fournisseurValidators');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only PDF files
    const allowedTypes = ['application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Seuls les fichiers PDF sont acceptés.'), false);
    }
  }
});

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
  .get(protect, paginationMiddleware, getFournisseurs)
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
   *   get:
   *     summary: Récupérer un fournisseur par son ID
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
   *         description: Fournisseur trouvé avec succès.
   *       404:
   *         description: Fournisseur non trouvé.
   */
  .get(protect, getFournisseurById)
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

// Document management routes
router.route("/:id/documents")
  /**
   * @swagger
   * /fournisseurs/{id}/documents:
   *   post:
   *     summary: Upload a document for a supplier
   *     tags: [Fournisseurs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the supplier
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               document:
   *                 type: string
   *                 format: binary
   *                 description: Document file (PDF only)
   *               nomDocument:
   *                 type: string
   *                 description: Document name
   *               typeDocument:
   *                 type: string
   *                 enum: [Certificat BRC, Autre type]
   *                 description: Document type
   *               dateExpiration:
   *                 type: string
   *                 format: date
   *                 description: Document expiration date
   *             required:
   *               - document
   *               - nomDocument
   *               - typeDocument
   *     responses:
   *       201:
   *         description: Document uploaded successfully
   *       400:
   *         description: Invalid file type (only PDF allowed) or missing data
   *       404:
   *         description: Supplier not found
   */
  .post(protect, upload.single('document'), uploadDocument);

router.route("/:id/documents/:documentId")
  /**
   * @swagger
   * /fournisseurs/{id}/documents/{documentId}:
   *   delete:
   *     summary: Delete a document from a supplier
   *     tags: [Fournisseurs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the supplier
   *       - in: path
   *         name: documentId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the document
   *     responses:
   *       200:
   *         description: Document deleted successfully
   *       404:
   *         description: Supplier or document not found
   */
  .delete(protect, deleteDocument);

module.exports = router;

