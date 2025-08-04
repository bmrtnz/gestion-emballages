const http = require('http');

const testUrl = 'http://localhost:9000/documents/test-image.jpg';

console.log('Testing MinIO access...');
console.log(`URL: ${testUrl}`);

http.get(testUrl, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Headers:', res.headers);
    
    if (res.statusCode === 403) {
        console.log('❌ Access Denied - Bucket is private');
        console.log('Run: node scripts/update-minio-policy.js to fix this');
    } else if (res.statusCode === 404) {
        console.log('✅ Bucket is accessible (file not found is expected)');
    } else if (res.statusCode === 200) {
        console.log('✅ Bucket is accessible and file exists');
    }
}).on('error', (err) => {
    console.error('❌ Error accessing MinIO:', err.message);
    console.log('Make sure MinIO is running on http://localhost:9000');
});