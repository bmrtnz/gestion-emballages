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
  UseInterceptors,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { FournisseursService } from './fournisseurs.service';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
import { UpdateFournisseurDto } from './dto/update-fournisseur.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';

@ApiTags('Fournisseurs')
@Controller('fournisseurs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class FournisseursController {
  constructor(private readonly fournisseursService: FournisseursService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get all active suppliers for selection' })
  @ApiResponse({ status: 200, description: 'Active suppliers retrieved successfully' })
  async findActiveFournisseurs() {
    return this.fournisseursService.findActiveFournisseurs();
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.GESTIONNAIRE)
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created successfully' })
  async create(@Body() createFournisseurDto: CreateFournisseurDto, @Request() req) {
    const fournisseurData = {
      ...createFournisseurDto,
      createdById: req.user.id
    };
    return this.fournisseursService.create(fournisseurData);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.GESTIONNAIRE)
  @ApiOperation({ summary: 'Get all suppliers with pagination' })
  @ApiResponse({ status: 200, description: 'Suppliers retrieved successfully' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.fournisseursService.findAll(paginationDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.GESTIONNAIRE)
  @ApiOperation({ summary: 'Get supplier by ID' })
  @ApiResponse({ status: 200, description: 'Supplier retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.fournisseursService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.GESTIONNAIRE)
  @ApiOperation({ summary: 'Update supplier' })
  @ApiResponse({ status: 200, description: 'Supplier updated successfully' })
  async update(
    @Param('id') id: string, 
    @Body() updateFournisseurDto: UpdateFournisseurDto,
    @Request() req
  ) {
    const fournisseurData = {
      ...updateFournisseurDto,
      updatedById: req.user.id
    };
    return this.fournisseursService.update(id, fournisseurData);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.GESTIONNAIRE)
  @ApiOperation({ summary: 'Deactivate supplier' })
  @ApiResponse({ status: 200, description: 'Supplier deactivated successfully' })
  async remove(@Param('id') id: string) {
    return this.fournisseursService.remove(id);
  }

  @Patch(':id/reactivate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.GESTIONNAIRE)
  @ApiOperation({ summary: 'Reactivate supplier' })
  @ApiResponse({ status: 200, description: 'Supplier reactivated successfully' })
  async reactivate(@Param('id') id: string) {
    return this.fournisseursService.reactivate(id);
  }
}