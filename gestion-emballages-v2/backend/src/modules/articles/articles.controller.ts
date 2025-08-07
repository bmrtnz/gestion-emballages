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

import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CreateArticleFournisseurDto } from './dto/create-article-fournisseur.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';

@ApiTags('Articles')
@Controller('articles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get article categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  getCategories() {
    return { categories: this.articlesService.getCategories() };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search articles for autocomplete' })
  @ApiResponse({ status: 200, description: 'Articles found' })
  async searchArticles(@Query('q') query: string, @Query('limit') limit?: number) {
    return this.articlesService.searchArticles(query, limit);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.GESTIONNAIRE)
  @ApiOperation({ summary: 'Create a new article' })
  @ApiResponse({ status: 201, description: 'Article created successfully' })
  async create(@Body() createArticleDto: CreateArticleDto, @Request() req) {
    // Add created by user ID
    const articleData = {
      ...createArticleDto,
      createdById: req.user.id
    };
    return this.articlesService.create(articleData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all articles with pagination' })
  @ApiResponse({ status: 200, description: 'Articles retrieved successfully' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.articlesService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get article by ID' })
  @ApiResponse({ status: 200, description: 'Article retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.GESTIONNAIRE)
  @ApiOperation({ summary: 'Update article' })
  @ApiResponse({ status: 200, description: 'Article updated successfully' })
  async update(
    @Param('id') id: string, 
    @Body() updateArticleDto: UpdateArticleDto,
    @Request() req
  ) {
    // Add updated by user ID
    const articleData = {
      ...updateArticleDto,
      updatedById: req.user.id
    };
    return this.articlesService.update(id, articleData);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.GESTIONNAIRE)
  @ApiOperation({ summary: 'Deactivate article' })
  @ApiResponse({ status: 200, description: 'Article deactivated successfully' })
  async remove(@Param('id') id: string) {
    return this.articlesService.remove(id);
  }

  @Patch(':id/reactivate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.GESTIONNAIRE)
  @ApiOperation({ summary: 'Reactivate article' })
  @ApiResponse({ status: 200, description: 'Article reactivated successfully' })
  async reactivate(@Param('id') id: string) {
    return this.articlesService.reactivate(id);
  }

  // Article-Fournisseur relationship endpoints
  @Post(':id/fournisseurs')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.GESTIONNAIRE)
  @ApiOperation({ summary: 'Add supplier to article' })
  @ApiResponse({ status: 201, description: 'Supplier added to article successfully' })
  async addFournisseur(
    @Param('id') articleId: string,
    @Body() createArticleFournisseurDto: CreateArticleFournisseurDto
  ) {
    return this.articlesService.addFournisseur(articleId, createArticleFournisseurDto);
  }

  @Patch(':id/fournisseurs/:fournisseurInfoId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.GESTIONNAIRE)
  @ApiOperation({ summary: 'Update article-supplier relationship' })
  @ApiResponse({ status: 200, description: 'Article-supplier relationship updated successfully' })
  async updateFournisseur(
    @Param('id') articleId: string,
    @Param('fournisseurInfoId') fournisseurInfoId: string,
    @Body() updateData: Partial<CreateArticleFournisseurDto>
  ) {
    return this.articlesService.updateFournisseur(articleId, fournisseurInfoId, updateData);
  }

  @Delete(':id/fournisseurs/:fournisseurInfoId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.GESTIONNAIRE)
  @ApiOperation({ summary: 'Remove supplier from article' })
  @ApiResponse({ status: 200, description: 'Supplier removed from article successfully' })
  async removeFournisseur(
    @Param('id') articleId: string,
    @Param('fournisseurInfoId') fournisseurInfoId: string
  ) {
    return this.articlesService.removeFournisseur(articleId, fournisseurInfoId);
  }
}