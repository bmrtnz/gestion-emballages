const express = require('express');
const router = express.Router();
const { minioClient, bucketName } = require('../config/minioClient');
const { protect } = require('../middleware/authMiddleware');

// Get presigned URL for image viewing
router.get('/image/:filename', protect, async (req, res) => {
    try {
        const { filename } = req.params;
        
        // Generate a presigned URL valid for 1 hour
        const presignedUrl = await minioClient.presignedGetObject(
            bucketName, 
            filename, 
            60 * 60 // 1 hour expiry
        );
        
        res.json({ 
            success: true, 
            imageUrl: presignedUrl,
            expiresIn: 3600 // seconds
        });
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error generating image URL' 
        });
    }
});

module.exports = router;