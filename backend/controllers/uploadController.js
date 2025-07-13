// backend/controllers/uploadController.js
const { minioClient, bucketName } = require('../config/minioClient');
const asyncHandler = require('../utils/asyncHandler');
const { BadRequestError } = require('../utils/appError');
const config = require('../config/env');

/**
 * @description Uploader un fichier vers le stockage objet MinIO.
 *              Le fichier est reçu via `multer` en mémoire tampon.
 * @route POST /api/upload
 * @access Privé
 * @param {object} req - L'objet de requête Express, contenant `req.file` grâce à multer.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le prochain middleware Express.
 */
exports.uploadFile = asyncHandler(async (req, res, next) => {
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
});
