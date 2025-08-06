import { Controller, Post, Body, UseGuards, Get, Request, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserResponseDto } from '@modules/users/dto/user-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  async test() {
    return { status: 'ok', message: 'Auth controller is working' };
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful', 
    type: AuthResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials' 
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      console.log('Login attempt:', loginDto.email);
      const result = await this.authService.login(loginDto);
      console.log('Login successful for:', loginDto.email);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully', 
    type: UserResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getProfile(@Request() req): Promise<UserResponseDto> {
    return this.authService.getProfile(req.user.id);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully', 
    type: AuthResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized' 
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async refresh(@Request() req): Promise<AuthResponseDto> {
    return this.authService.refreshToken(req.user);
  }
}