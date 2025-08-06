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

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.MANAGER, UserRole.GESTIONNAIRE)
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
  @Roles(UserRole.MANAGER, UserRole.GESTIONNAIRE)
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ 
    status: 200, 
    description: 'Users retrieved successfully' 
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    try {
      console.log('Users findAll called with:', paginationDto);
      const result = await this.usersService.findAll(paginationDto);
      console.log('Users findAll successful, returned:', result.data?.length, 'users');
      return result;
    } catch (error) {
      console.error('Users findAll error:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
  }

  @Get(':id')
  @Roles(UserRole.MANAGER, UserRole.GESTIONNAIRE)
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
  @Roles(UserRole.MANAGER, UserRole.GESTIONNAIRE)
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
  @Roles(UserRole.MANAGER, UserRole.GESTIONNAIRE)
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiResponse({ 
    status: 200, 
    description: 'User deactivated successfully' 
  })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/reactivate')
  @Roles(UserRole.MANAGER, UserRole.GESTIONNAIRE)
  @ApiOperation({ summary: 'Reactivate user' })
  @ApiResponse({ 
    status: 200, 
    description: 'User reactivated successfully', 
    type: UserResponseDto 
  })
  async reactivate(@Param('id') id: string) {
    return this.usersService.reactivate(id);
  }
}