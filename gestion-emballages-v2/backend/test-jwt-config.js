// Quick test to check JWT configuration
const authConfig = require('./dist/config/auth.config').authConfig;

console.log('JWT Configuration Test');
console.log('=====================');
console.log('JWT Secret:', authConfig.jwtSecret ? 'Configured ✓' : 'NOT CONFIGURED ✗');
console.log('JWT Expires:', authConfig.jwtExpiresIn);

// Check environment variables
console.log('\nEnvironment Variables:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set ✓' : 'Not set ✗');
console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN || 'Not set (using default)');

// Test bcrypt
try {
    const bcrypt = require('bcrypt');
    console.log('\nbcrypt module: Loaded ✓');
    
    // Test hash
    const testHash = bcrypt.hashSync('test', 10);
    console.log('bcrypt hash test: Working ✓');
} catch (error) {
    console.log('\nbcrypt module: ERROR ✗');
    console.log(error.message);
}