// backend/controllers/uploadController.js
const { minioClient, bucketName } = require('../config/minioClient');

exports.uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier sélectionné.' });
    }

    try {
        // Créer un nom de fichier unique pour éviter les conflits
        const fileName = `${Date.now()}-${req.file.originalname}`;
        
        // Uploader le fichier vers MinIO
        await minioClient.putObject(bucketName, fileName, req.file.buffer, req.file.size);

        // Renvoyer le nom du fichier (la clé) au client
        res.status(201).json({
            message: 'Fichier uploadé avec succès',
            fileKey: fileName
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'upload du fichier', error: error.message });
    }
};