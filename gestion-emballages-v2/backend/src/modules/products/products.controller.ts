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

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductSupplierDto } from './dto/create-product-supplier.dto';
import { UpdateProductSupplierDto } from './dto/update-product-supplier.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class ProductsController {
  constructor(private readonly ProductsService: ProductsService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get Product categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  getCategories() {
    return { categories: this.ProductsService.getCategories() };
  }

  @Get('conditioning-units')
  @ApiOperation({ summary: 'Get conditioning units' })
  @ApiResponse({ status: 200, description: 'Conditioning units retrieved successfully' })
  getConditioningUnits() {
    return { conditioningUnits: this.ProductsService.getConditioningUnits() };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products for autocomplete' })
  @ApiResponse({ status: 200, description: 'Products found' })
  async searchProducts(@Query('q') query: string, @Query('limit') limit?: number) {
    return this.ProductsService.searchProducts(query, limit);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Create a new Product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async create(@Body() CreateProductDto: CreateProductDto, @Request() req) {
    // Add created by user ID
    const productData = {
      ...CreateProductDto,
      createdById: req.user.id,
    };
    return this.ProductsService.create(productData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.ProductsService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.ProductsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Update Product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  async update(@Param('id') id: string, @Body() UpdateProductDto: UpdateProductDto, @Request() req) {
    // Add updated by user ID
    const productData = {
      ...UpdateProductDto,
      updatedById: req.user.id,
    };
    return this.ProductsService.update(id, productData);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Deactivate Product' })
  @ApiResponse({ status: 200, description: 'Product deactivated successfully' })
  async remove(@Param('id') id: string) {
    return this.ProductsService.remove(id);
  }

  @Patch(':id/reactivate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Reactivate Product' })
  @ApiResponse({ status: 200, description: 'Product reactivated successfully' })
  async reactivate(@Param('id') id: string) {
    return this.ProductsService.reactivate(id);
  }

  // Product-Supplier relationship endpoints
  @Post(':id/suppliers')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Add supplier to Product' })
  @ApiResponse({ status: 201, description: 'Supplier added to Product successfully' })
  async addSupplier(@Param('id') productId: string, @Body() CreateProductSupplierDto: CreateProductSupplierDto) {
    return this.ProductsService.addSupplier(productId, CreateProductSupplierDto);
  }

  @Patch(':id/suppliers/:supplierInfoId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Update Product-supplier relationship' })
  @ApiResponse({ status: 200, description: 'Product-supplier relationship updated successfully' })
  async updateSupplier(
    @Param('id') productId: string,
    @Param('supplierInfoId') supplierInfoId: string,
    @Body() updateData: UpdateProductSupplierDto
  ) {
    return this.ProductsService.updateSupplier(productId, supplierInfoId, updateData);
  }

  @Delete(':id/suppliers/:supplierInfoId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Remove supplier from Product' })
  @ApiResponse({ status: 200, description: 'Supplier removed from Product successfully' })
  async removeSupplier(@Param('id') productId: string, @Param('supplierInfoId') supplierInfoId: string) {
    return this.ProductsService.removeSupplier(productId, supplierInfoId);
  }
}
