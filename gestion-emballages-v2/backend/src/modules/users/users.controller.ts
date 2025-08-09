import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';
import { DataIntegrityService } from '@common/services/data-integrity.service';

@ApiTags('Users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly dataIntegrityService: DataIntegrityService,
  ) {}

  // Development-only endpoint (no authentication required)
  @Get('dev/list')
  @ApiOperation({ summary: 'Get users for development login selector (no auth required)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Users retrieved for development purposes' 
  })
  async getDevUsers(@Query() paginationDto: PaginationDto) {
    // Only allow in development environment
    const nodeEnv = this.configService.get('NODE_ENV');
    if (nodeEnv === 'production') {
      throw new Error('Development endpoint not available in production');
    }

    try {
      const result = await this.usersService.findAll({
        ...paginationDto,
        limit: 100,
        status: 'active'
      });
      
      // Return simplified user data for login selector
      // The service already populates station and Supplier data dynamically
      const simplifiedUsers = result.data.map(user => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        station: (user as any).station ? { 
          id: (user as any).station.id, 
          name: (user as any).station.name 
        } : null,
        supplier: (user as any).Supplier ? { 
          id: (user as any).Supplier.id, 
          name: (user as any).Supplier.name 
        } : null
      }));
      
      return {
        ...result,
        data: simplifiedUsers
      };
    } catch (error) {
      console.error('Dev users endpoint error:', error.message);
      throw error;
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully', 
    type: UserResponseDto 
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ 
    status: 200, 
    description: 'Users retrieved successfully' 
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      const result = await this.usersService.findAll(paginationDto);
      return result;
    } catch (error) {
      console.error('Users findAll error:', error.message);
      throw error;
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User retrieved successfully', 
    type: UserResponseDto 
  })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ 
    status: 200, 
    description: 'User updated successfully', 
    type: UserResponseDto 
  })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiResponse({ 
    status: 200, 
    description: 'User deactivated successfully' 
  })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/reactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reactivate user' })
  @ApiResponse({ 
    status: 200, 
    description: 'User reactivated successfully', 
    type: UserResponseDto 
  })
  async reactivate(@Param('id') id: string) {
    return this.usersService.reactivate(id);
  }

  // Admin-only hard delete operations
  @Get(':id/integrity-check')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check data integrity before hard delete (Admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Data integrity report generated' 
  })
  async checkDataIntegrity(@Param('id') id: string) {
    return this.dataIntegrityService.checkDeleteIntegrity('user', id);
  }

  @Delete(':id/hard-delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Permanently delete user with data integrity checks (Admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'User permanently deleted' 
  })
  async hardDelete(
    @Param('id') id: string,
    @Query('cascadeDelete') cascadeDelete?: boolean,
    @Query('confirmIntegrityCheck') confirmIntegrityCheck?: boolean
  ) {
    return this.dataIntegrityService.performHardDelete('user', id, {
      cascadeDelete: cascadeDelete === true,
      confirmIntegrityCheck: confirmIntegrityCheck === true
    });
  }

  @Post('password-reset-link')
  @ApiOperation({ summary: 'Send password reset link via email' })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset link sent successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid email format' 
  })
  async sendPasswordResetLink(@Body() body: { email: string }) {
    return this.usersService.sendPasswordResetLink(body.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with valid token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid or expired token' 
  })
  async resetPassword(@Body() body: { token: string; password: string }) {
    return this.usersService.resetPassword(body.token, body.password);
  }
}