const Minio = require('minio');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('MinIO Configuration:');
console.log('- Endpoint:', process.env.MINIO_ENDPOINT || 'localhost');
console.log('- Port:', process.env.MINIO_PORT || 9000);
console.log('- Access Key:', process.env.MINIO_ROOT_USER ? '***' + process.env.MINIO_ROOT_USER.slice(-4) : 'NOT SET');

// Check if credentials are set
if (!process.env.MINIO_ROOT_USER || !process.env.MINIO_ROOT_PASSWORD) {
    console.error('❌ MinIO credentials not found in environment variables.');
    console.error('Please ensure MINIO_ROOT_USER and MINIO_ROOT_PASSWORD are set in the .env file');
    process.exit(1);
}

// MinIO client configuration
const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ROOT_USER,
    secretKey: process.env.MINIO_ROOT_PASSWORD
});

const bucketName = 'documents';

// Public read policy
const publicPolicy = {
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

async function updateBucketPolicy() {
    try {
        // Check if bucket exists
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
            console.log(`Bucket "${bucketName}" does not exist. Creating...`);
            await minioClient.makeBucket(bucketName, 'us-east-1');
            console.log(`Bucket "${bucketName}" created successfully.`);
        }

        // Set bucket policy to public
        console.log(`Setting public read policy for bucket "${bucketName}"...`);
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(publicPolicy));
        console.log(`✅ Public read policy applied successfully to bucket "${bucketName}"`);
        
        // Verify the policy
        const currentPolicy = await minioClient.getBucketPolicy(bucketName);
        console.log('\nCurrent bucket policy:');
        console.log(JSON.stringify(JSON.parse(currentPolicy), null, 2));
        
    } catch (error) {
        console.error('❌ Error updating bucket policy:', error);
        console.error('Make sure MinIO is running and credentials are correct.');
    }
}

// Run the update
updateBucketPolicy();