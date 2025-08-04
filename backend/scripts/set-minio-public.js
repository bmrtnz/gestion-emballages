const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function setBucketPublic() {
    console.log('Setting MinIO bucket to public...\n');
    
    // Using curl to set bucket policy directly via MinIO API
    const policyJson = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": "*",
                "Action": ["s3:GetObject"],
                "Resource": ["arn:aws:s3:::documents/*"]
            }
        ]
    };

    const commands = [
        // Using MinIO's REST API directly
        `curl -X PUT "http://minioadmin:minioadmin123@localhost:9000/documents?policy" -H "Content-Type: application/json" -d '${JSON.stringify(policyJson)}'`,
        
        // Alternative: Using aws CLI if available
        `aws --endpoint-url http://localhost:9000 s3api put-bucket-policy --bucket documents --policy '${JSON.stringify(policyJson)}' --no-verify-ssl`
    ];

    console.log('Attempting to set bucket policy using direct API call...\n');
    
    try {
        // Try the curl command
        const curlCommand = `curl -X PUT "http://localhost:9000/documents?policy" -H "Authorization: AWS4-HMAC-SHA256 Credential=minioadmin" -H "Content-Type: application/json" -d '${JSON.stringify(policyJson)}'`;
        
        console.log('If curl is available, run this command manually:');
        console.log('----------------------------------------');
        console.log(curlCommand);
        console.log('----------------------------------------\n');
        
    } catch (error) {
        console.error('Error:', error.message);
    }

    // Alternative method using MinIO SDK with different approach
    console.log('\nAlternative: Using MinIO JavaScript Client...\n');
    
    const Minio = require('minio');
    
    const minioClient = new Minio.Client({
        endPoint: 'localhost',
        port: 9000,
        useSSL: false,
        accessKey: 'minioadmin',
        secretKey: 'minioadmin123'
    });

    try {
        // First check if bucket exists
        const exists = await minioClient.bucketExists('documents');
        console.log(`Bucket 'documents' exists: ${exists}`);
        
        if (!exists) {
            console.log('Creating bucket...');
            await minioClient.makeBucket('documents', 'us-east-1');
        }

        // Set anonymous access policy
        const policy = JSON.stringify({
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicRead",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": ["s3:GetObject"],
                    "Resource": ["arn:aws:s3:::documents/*"]
                }
            ]
        });

        console.log('Setting bucket policy...');
        await minioClient.setBucketPolicy('documents', policy);
        console.log('✅ Bucket policy set successfully!');
        
        // Verify the policy
        const currentPolicy = await minioClient.getBucketPolicy('documents');
        console.log('\nCurrent policy:');
        console.log(JSON.parse(currentPolicy));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\nIf this fails, try one of these methods:');
        console.error('1. Use mc (MinIO Client):');
        console.error('   mc alias set myminio http://localhost:9000 minioadmin minioadmin123');
        console.error('   mc anonymous set public myminio/documents');
        console.error('\n2. Use AWS CLI:');
        console.error('   aws configure set aws_access_key_id minioadmin');
        console.error('   aws configure set aws_secret_access_key minioadmin123');
        console.error('   aws --endpoint-url http://localhost:9000 s3api put-bucket-policy --bucket documents --policy file://policy.json');
    }
}

setBucketPublic().catch(console.error);