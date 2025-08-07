// Direct test to see actual auth error
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './modules/auth/auth.service';

async function testAuth() {
  console.log('🔍 Direct Auth Service Test');
  console.log('===========================\n');

  try {
    // Create app
    const app = await NestFactory.createApplicationContext(AppModule);
    console.log('✅ Application context created\n');

    // Get auth service
    const authService = app.get(AuthService);
    console.log('✅ Auth service loaded\n');

    // Test credentials
    const testEmail = 'nicole@embadif.com';
    const testPassword = 'password123';
    
    console.log(`Testing login with: ${testEmail}\n`);

    try {
      // Test validateUser directly
      console.log('1. Testing validateUser method...');
      const user = await authService.validateUser(testEmail, testPassword);
      
      if (user) {
        console.log('✅ User validated successfully!');
        console.log('User:', {
          id: user.id,
          email: user.email,
          role: user.role,
          entityType: user.entityType
        });
      } else {
        console.log('❌ User validation failed - invalid credentials');
      }

      // Test login
      console.log('\n2. Testing login method...');
      const loginResult = await authService.login({ email: testEmail, password: testPassword });
      console.log('✅ Login successful!');
      console.log('Token:', loginResult.accessToken.substring(0, 50) + '...');
      
    } catch (error) {
      console.error('❌ Auth Error:', error.message);
      console.error('Stack:', error.stack);
    }

    await app.close();
  } catch (error) {
    console.error('❌ Application Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAuth();