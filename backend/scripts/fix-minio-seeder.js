const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function fixMinIOSeeder() {
    console.log('🔧 Fixing MinIO for seeder...\n');
    
    try {
        console.log('1. Stopping MinIO container...');
        await execAsync('docker-compose stop minio');
        
        console.log('2. Removing MinIO container and data...');
        await execAsync('docker-compose rm -f minio');
        
        console.log('3. Removing MinIO volume...');
        try {
            await execAsync('docker volume rm gestion-emballages_minio-data');
        } catch (e) {
            console.log('   (Volume might not exist, continuing...)');
        }
        
        console.log('4. Starting fresh MinIO container...');
        await execAsync('docker-compose up -d minio');
        
        console.log('5. Waiting for MinIO to start...');
        await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15 seconds
        
        console.log('6. Testing MinIO connection...');
        const { spawn } = require('child_process');
        const debugScript = spawn('node', ['scripts/debug-minio-connection.js'], { 
            stdio: 'inherit',
            cwd: process.cwd()
        });
        
        debugScript.on('close', (code) => {
            if (code === 0) {
                console.log('\n✅ MinIO should now be ready for the seeder!');
                console.log('Try running: npm run data:import');
            } else {
                console.log('\n❌ There are still issues with MinIO connection');
            }
        });
        
    } catch (error) {
        console.error('❌ Error fixing MinIO:', error.message);
        console.log('\nTry manual steps:');
        console.log('1. docker-compose stop minio');
        console.log('2. docker-compose rm -f minio');
        console.log('3. docker volume rm gestion-emballages_minio-data');
        console.log('4. docker-compose up -d minio');
        console.log('5. Wait 15 seconds');
        console.log('6. npm run data:import');
    }
}

fixMinIOSeeder();