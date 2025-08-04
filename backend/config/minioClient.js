// backend/config/minioClient.js
const Minio = require('minio');
const config = require('./env');

const minioClient = new Minio.Client({
    endPoint: config.minio.endPoint,
    port: config.minio.port,
    useSSL: config.minio.useSSL,
    accessKey: config.minio.accessKey,
    secretKey: config.minio.secretKey
});

const bucketName = 'documents';
const policy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": ["*"]
            },
            "Action": [
                "s3:GetBucketLocation",
                "s3:ListBucket"
            ],
            "Resource": [`arn:aws:s3:::${bucketName}`]
        },
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": ["*"]
            },
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [`arn:aws:s3:::${bucketName}/*`]
        }
    ]
};

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
            minioClient.setBucketPolicy(bucketName, JSON.stringify(policy), (err) => {
                if (err) {
                    return console.log('Erreur définition policy:', err);
                }
                console.log(`Policy public-read appliquée au bucket "${bucketName}".`);
            });
        });
    });
};

// Exporter le client et le nom du bucket
module.exports = { minioClient, bucketName, checkBucket };
