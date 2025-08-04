const dotenv = require('dotenv');
const path = require('path');
const Minio = require('minio');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('=== MINIO DEBUG INFORMATION ===\n');

console.log('Environment Variables:');
console.log('- MINIO_ROOT_USER:', process.env.MINIO_ROOT_USER);
console.log('- MINIO_ROOT_PASSWORD:', process.env.MINIO_ROOT_PASSWORD ? '***' : 'NOT SET');
console.log('- MINIO_EXTERNAL_HOST:', process.env.MINIO_EXTERNAL_HOST);
console.log('- MINIO_PORT:', process.env.MINIO_PORT);
console.log('- MINIO_ENDPOINT:', process.env.MINIO_ENDPOINT);

console.log('\nFallback Values Check:');
const accessKey = process.env.MINIO_ROOT_USER || 'VOTRE_ACCESS_KEY';
const secretKey = process.env.MINIO_ROOT_PASSWORD || 'VOTRE_SECRET_KEY';
const endPoint = process.env.MINIO_EXTERNAL_HOST || 'localhost';
const port = parseInt(process.env.MINIO_PORT, 10) || 9000;

console.log('- Resolved accessKey:', accessKey);
console.log('- Resolved secretKey:', secretKey === 'VOTRE_SECRET_KEY' ? 'USING FALLBACK!' : '***');
console.log('- Resolved endPoint:', endPoint);
console.log('- Resolved port:', port);

console.log('\nTesting MinIO connection...');

const minioClient = new Minio.Client({
    endPoint,
    port,
    useSSL: false,
    accessKey,
    secretKey
});

async function testConnection() {
    try {
        console.log('Attempting to check if bucket exists...');
        const exists = await minioClient.bucketExists('documents');
        console.log('✅ SUCCESS: MinIO connection working!');
        console.log('- Bucket "documents" exists:', exists);
        
        // Try to list buckets
        const buckets = await minioClient.listBuckets();
        console.log('- Available buckets:', buckets.map(b => b.name));
        
    } catch (error) {
        console.error('❌ ERROR: MinIO connection failed');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        if (error.code === 'InvalidAccessKeyId') {
            console.error('\n🔍 DIAGNOSIS: The access key is not recognized by MinIO');
            console.error('This usually means:');
            console.error('1. MinIO was started with different credentials');
            console.error('2. Environment variables are not loaded correctly');
            console.error('3. MinIO container needs to be recreated');
        }
    }
}

testConnection();