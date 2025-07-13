// backend/config/env.js
const dotenv = require('dotenv');

// Charger les variables d'environnement du fichier .env
dotenv.config();

// Valider et exporter les variables d'environnement
const config = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV || 'development',
    minio: {
        endPoint: process.env.MINIO_ENDPOINT,
        port: parseInt(process.env.MINIO_PORT, 10),
        useSSL: process.env.MINIO_SSL === 'true',
        accessKey: process.env.MINIO_ROOT_USER,
        secretKey: process.env.MINIO_ROOT_PASSWORD,
        externalHost: process.env.MINIO_EXTERNAL_HOST || process.env.MINIO_ENDPOINT,
    }
};

// Vérification simple que les variables critiques sont définies
if (!config.mongoUri || !config.jwtSecret) {
    console.error("FATAL ERROR: MONGO_URI and JWT_SECRET must be defined in .env file.");
    process.exit(1);
}

module.exports = config;
