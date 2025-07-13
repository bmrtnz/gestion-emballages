// backend/routes/uploadRoutes.js
const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const { uploadFile } = require("../controllers/uploadController");

const router = express.Router();

/**
 * @fileoverview Route pour l'upload de fichiers.
 * @module routes/uploadRoutes
 */

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Upload de fichiers
 */

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router
    .route("/")
    /**
     * @swagger
     * /upload:
     *   post:
     *     summary: Uploader un fichier
     *     tags: [Upload]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               file:
     *                 type: string
     *                 format: binary
     *     responses:
     *       201:
     *         description: Fichier uploadé avec succès.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 fileUrl:
     *                   type: string
     *                 fileKey:
     *                   type: string
     */
    .post(protect, upload.single("file"), uploadFile);

module.exports = router;
