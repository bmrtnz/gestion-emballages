import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-Supplier.dto';
import { UpdateSupplierDto } from './dto/update-Supplier.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';

@ApiTags('Suppliers')
@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get all active suppliers for selection' })
  @ApiResponse({ status: 200, description: 'Active suppliers retrieved successfully' })
  async findActiveFournisseurs() {
    return this.suppliersService.findActiveFournisseurs();
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created successfully' })
  async create(@Body() createSupplierDto: CreateSupplierDto, @Request() req) {
    const fournisseurData = {
      ...createSupplierDto,
      createdById: req.user.id,
    };
    return this.suppliersService.create(fournisseurData);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Get all suppliers with pagination' })
  @ApiResponse({ status: 200, description: 'Suppliers retrieved successfully' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.suppliersService.findAll(paginationDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Get supplier by ID' })
  @ApiResponse({ status: 200, description: 'Supplier retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Update supplier' })
  @ApiResponse({ status: 200, description: 'Supplier updated successfully' })
  async update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto, @Request() req) {
    const fournisseurData = {
      ...updateSupplierDto,
      updatedById: req.user.id,
    };
    return this.suppliersService.update(id, fournisseurData);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Deactivate supplier' })
  @ApiResponse({ status: 200, description: 'Supplier deactivated successfully' })
  async remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }

  @Patch(':id/reactivate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Reactivate supplier' })
  @ApiResponse({ status: 200, description: 'Supplier reactivated successfully' })
  async reactivate(@Param('id') id: string) {
    return this.suppliersService.reactivate(id);
  }
}
