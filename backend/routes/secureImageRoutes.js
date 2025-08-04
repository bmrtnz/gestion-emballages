const express = require('express');
const router = express.Router();
const { minioClient, bucketName } = require('../config/minioClient');
const { protect } = require('../middleware/authMiddleware');

// Serve images through authenticated backend
router.get('/secure-image/:filename', protect, async (req, res) => {
    try {
        const { filename } = req.params;
        
        // Check if user has permission to view this image
        // Add your authorization logic here
        
        // Get the object from MinIO
        const stream = await minioClient.getObject(bucketName, filename);
        
        // Set appropriate headers
        res.setHeader('Content-Type', 'image/jpeg'); // or detect from filename
        res.setHeader('Cache-Control', 'private, max-age=3600');
        
        // Pipe the stream to response
        stream.pipe(res);
        
    } catch (error) {
        if (error.code === 'NoSuchKey') {
            return res.status(404).json({ message: 'Image not found' });
        }
        
        console.error('Error serving image:', error);
        res.status(500).json({ message: 'Error serving image' });
    }
});

module.exports = router;