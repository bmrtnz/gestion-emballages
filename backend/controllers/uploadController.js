/**
 * @fileoverview Contrôleur pour la gestion des uploads de fichiers vers MinIO
 * @module controllers/uploadController
 * @requires config/minioClient
 * @requires utils/appError
 * @requires config/env
 * @author Gestion Emballages Team
 * @since 1.0.0
 */

// backend/controllers/uploadController.js
const { minioClient, bucketName } = require('../config/minioClient');
// Removed asyncHandler for cleaner testing and error handling
const { BadRequestError } = require('../utils/appError');
const config = require('../config/env');

/**
 * Uploader un fichier vers le stockage objet MinIO.
 * Le fichier est reçu via `multer` en mémoire tampon.
 * @function uploadFile
 * @memberof module:controllers/uploadController
 * @param {Express.Request} req - L'objet de requête Express
 * @param {Object} req.file - Fichier uploadé (ajouté par le middleware multer)
 * @param {Buffer} req.file.buffer - Contenu du fichier en buffer
 * @param {string} req.file.originalname - Nom original du fichier
 * @param {number} req.file.size - Taille du fichier en octets
 * @param {string} req.file.mimetype - Type MIME du fichier
 * @param {Express.Response} res - L'objet de réponse Express
 * @param {Function} next - Le prochain middleware Express
 * @returns {Promise<void>} Renvoie l'URL du fichier uploadé et sa clé avec le statut 201
 * @throws {BadRequestError} Si aucun fichier n'est fourni
 * @since 1.0.0
 * @example
 * // POST /api/upload
 * // Content-Type: multipart/form-data
 * // Body: fichier en multipart
 * // Response: { "message": "Fichier uploadé avec succès", "fileUrl": "http://localhost:9000/bucket/1234567890-document.pdf", "fileKey": "1234567890-document.pdf" }
 */
exports.uploadFile = async (req, res, next) => {
    try {
        // Vérifie si un fichier a bien été inclus dans la requête.
        if (!req.file) {
            return next(new BadRequestError('Aucun fichier sélectionné.'));
        }

        // Crée un nom de fichier unique en préfixant le nom original avec un timestamp
        // pour éviter les conflits de noms.
        const fileName = `${Date.now()}-${req.file.originalname}`;
        
        // Uploade le buffer du fichier vers le bucket MinIO.
        await minioClient.putObject(bucketName, fileName, req.file.buffer, req.file.size);

        // Construit l'URL publique complète du fichier uploadé.
        const fileUrl = `${config.minio.useSSL ? 'https' : 'http'}://${config.minio.externalHost}:${config.minio.port}/${bucketName}/${fileName}`;

        // Renvoie une réponse de succès avec un message, l'URL accessible par le client,
        // et la clé du fichier pour référence interne.
        res.status(201).json({
            message: 'Fichier uploadé avec succès',
            fileUrl: fileUrl, 
            fileKey: fileName 
        });
    } catch (error) {
        next(error);
    }
};
