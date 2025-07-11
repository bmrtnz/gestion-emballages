// backend/routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { uploadFile } = require('../controllers/uploadController');

const router = express.Router();

// Configurer multer pour stocker le fichier en mémoire tampon
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// La route attend un seul fichier, dans un champ nommé "file"
router.post('/', protect, upload.single('file'), uploadFile);

module.exports = router;