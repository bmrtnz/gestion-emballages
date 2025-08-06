// Test controller directly
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthController } from './modules/auth/auth.controller';
import { LoginDto } from './modules/auth/dto/login.dto';

async function testController() {
  console.log('🔍 Direct Controller Test');
  console.log('========================\n');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    console.log('✅ Application context created\n');

    // Get controller
    const authController = app.get(AuthController);
    console.log('✅ Auth controller loaded\n');

    // Create DTO
    const loginDto = new LoginDto();
    loginDto.email = 'nicole@embadif.com';
    loginDto.password = 'password123';
    
    console.log('Testing controller.login() directly...\n');

    try {
      const result = await authController.login(loginDto);
      console.log('✅ Controller login successful!');
      console.log('Result:', {
        hasToken: !!result.accessToken,
        tokenLength: result.accessToken?.length,
        hasUser: !!result.user,
        userEmail: result.user?.email
      });
    } catch (error) {
      console.error('❌ Controller Error:', error.message);
      console.error('Error Type:', error.constructor.name);
      console.error('Stack:', error.stack);
    }

    await app.close();
  } catch (error) {
    console.error('❌ Application Error:', error.message);
  }
}

testController();