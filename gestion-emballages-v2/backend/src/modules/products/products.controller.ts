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

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductSupplierDto } from './dto/create-product-supplier.dto';
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

  @Get('search')
  @ApiOperation({ summary: 'Search articles for autocomplete' })
  @ApiResponse({ status: 200, description: 'Articles found' })
  async searchArticles(@Query('q') query: string, @Query('limit') limit?: number) {
    return this.ProductsService.searchArticles(query, limit);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Create a new Product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async create(@Body() CreateProductDto: CreateProductDto, @Request() req) {
    // Add created by user ID
    const articleData = {
      ...CreateProductDto,
      createdById: req.user.id
    };
    return this.ProductsService.create(articleData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all articles with pagination' })
  @ApiResponse({ status: 200, description: 'Articles retrieved successfully' })
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
  async update(
    @Param('id') id: string, 
    @Body() UpdateProductDto: UpdateProductDto,
    @Request() req
  ) {
    // Add updated by user ID
    const articleData = {
      ...UpdateProductDto,
      updatedById: req.user.id
    };
    return this.ProductsService.update(id, articleData);
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
  @Post(':id/fournisseurs')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Add supplier to Product' })
  @ApiResponse({ status: 201, description: 'Supplier added to Product successfully' })
  async addFournisseur(
    @Param('id') articleId: string,
    @Body() CreateProductSupplierDto: CreateProductSupplierDto
  ) {
    return this.ProductsService.addFournisseur(articleId, CreateProductSupplierDto);
  }

  @Patch(':id/fournisseurs/:fournisseurInfoId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Update Product-supplier relationship' })
  @ApiResponse({ status: 200, description: 'Product-supplier relationship updated successfully' })
  async updateFournisseur(
    @Param('id') articleId: string,
    @Param('fournisseurInfoId') fournisseurInfoId: string,
    @Body() updateData: Partial<CreateProductSupplierDto>
  ) {
    return this.ProductsService.updateFournisseur(articleId, fournisseurInfoId, updateData);
  }

  @Delete(':id/fournisseurs/:fournisseurInfoId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Remove supplier from Product' })
  @ApiResponse({ status: 200, description: 'Supplier removed from Product successfully' })
  async removeFournisseur(
    @Param('id') articleId: string,
    @Param('fournisseurInfoId') fournisseurInfoId: string
  ) {
    return this.ProductsService.removeFournisseur(articleId, fournisseurInfoId);
  }
}