// Simple test script to verify station-contacts endpoints
const http = require('http');

const BASE_URL = 'http://localhost:3001';
const API_BASE = '/api/v1';

// Test function
function testEndpoint(method, path, expectedStatus = 401) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `${API_BASE}${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      console.log(`${method} ${options.path} -> Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          path: options.path
        });
      });
    });

    req.on('error', (e) => {
      console.error(`Error testing ${method} ${options.path}:`, e.message);
      reject(e);
    });

    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('Testing Station Contacts API endpoints...\n');
  
  try {
    // Test if server is running
    await testEndpoint('GET', '/station-contacts');
    console.log('✓ Backend server is running and station-contacts endpoint exists');
    
    // Test specific contact endpoint
    await testEndpoint('GET', '/station-contacts/bf871a45-e912-4b1a-8cbe-51c781976e66');
    console.log('✓ Individual contact endpoint exists');
    
    // Test PATCH endpoint
    await testEndpoint('PATCH', '/station-contacts/bf871a45-e912-4b1a-8cbe-51c781976e66');
    console.log('✓ PATCH endpoint exists');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Backend server is not running on port 3001');
      console.log('\nTo start the backend:');
      console.log('cd gestion-emballages-v2/backend');
      console.log('npm run start:dev');
    }
  }
}

runTests();