// backend/config/minioClient.js
const Minio = require('minio');
const dotenv = require('dotenv');

dotenv.config();

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT),
    useSSL: false,
    accessKey: process.env.MINIO_ROOT_USER,
    secretKey: process.env.MINIO_ROOT_PASSWORD
});

const bucketName = 'documents';

// Vérifier si le bucket existe au démarrage et le créer sinon
const checkBucket = () => {
    minioClient.bucketExists(bucketName, (err, exists) => {
        if (err) {
            return console.log('Erreur connexion MinIO:', err);
        }
        if (exists) {
            return console.log(`Bucket MinIO "${bucketName}" trouvé.`);
        }
        minioClient.makeBucket(bucketName, 'us-east-1', (err) => {
            if (err) {
                return console.log('Erreur création bucket:', err);
            }
            console.log(`Bucket "${bucketName}" créé avec succès.`);
        });
    });
};

// Exporter le client et le nom du bucket
module.exports = { minioClient, bucketName, checkBucket };