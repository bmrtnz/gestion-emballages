// Test validation directly
import { validate } from 'class-validator';
import { LoginDto } from './modules/auth/dto/login.dto';

async function testValidation() {
  console.log('🔍 Testing LoginDto Validation');
  console.log('==============================\n');

  const loginDto = new LoginDto();
  loginDto.email = 'nicole@embadif.com';
  loginDto.password = 'password123';

  console.log('Testing DTO:', loginDto);
  
  const errors = await validate(loginDto);
  
  if (errors.length > 0) {
    console.log('❌ Validation errors:');
    errors.forEach(error => {
      console.log(`- ${error.property}: ${Object.values(error.constraints || {}).join(', ')}`);
    });
  } else {
    console.log('✅ Validation passed!');
  }

  // Test with invalid data
  console.log('\nTesting with invalid email:');
  const invalidDto = new LoginDto();
  invalidDto.email = 'not-an-email';
  invalidDto.password = 'pwd';
  
  const invalidErrors = await validate(invalidDto);
  console.log(`Found ${invalidErrors.length} validation error(s)`);
}

testValidation();