const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Testing TypeScript compilation...');
  
  // Change to backend directory
  process.chdir(__dirname);
  
  // Run tsc to check for compilation errors
  execSync('npx tsc --noEmit', { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  
  console.log('✅ TypeScript compilation successful!');
  process.exit(0);
} catch (error) {
  console.error('❌ TypeScript compilation failed');
  console.error(error.message);
  process.exit(1);
}