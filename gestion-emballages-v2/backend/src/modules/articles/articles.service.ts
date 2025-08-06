import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Article } from './entities/article.entity';
import { ArticleFournisseur } from './entities/article-fournisseur.entity';
import { Fournisseur } from '@modules/fournisseurs/entities/fournisseur.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CreateArticleFournisseurDto } from './dto/create-article-fournisseur.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationService, PaginationOptions } from '@common/services/pagination.service';
import { ArticleCategory } from '@common/enums/article-category.enum';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(ArticleFournisseur)
    private articleFournisseurRepository: Repository<ArticleFournisseur>,
    @InjectRepository(Fournisseur)
    private fournisseurRepository: Repository<Fournisseur>,
    private paginationService: PaginationService,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    // Check if article code already exists
    const existingArticle = await this.articleRepository.findOne({
      where: { codeArticle: createArticleDto.codeArticle }
    });

    if (existingArticle) {
      throw new ConflictException('Un article avec ce code existe déjà');
    }

    const article = this.articleRepository.create(createArticleDto);
    return this.articleRepository.save(article);
  }

  async findAll(paginationDto: PaginationDto) {
    const paginationOptions = this.paginationService.validatePaginationOptions({
      page: paginationDto.page || 1,
      limit: paginationDto.limit || 20,
      sortBy: paginationDto.sortBy || 'createdAt',
      sortOrder: paginationDto.sortOrder || 'DESC'
    });

    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.articleFournisseurs', 'articleFournisseur')
      .leftJoinAndSelect('articleFournisseur.fournisseur', 'fournisseur');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(article.codeArticle ILIKE :search OR article.designation ILIKE :search OR fournisseur.nom ILIKE :search)',
        { search: `%${paginationDto.search}%` }
      );
    }

    // Add status filter
    if (paginationDto.status === 'active') {
      queryBuilder.andWhere('article.isActive = :isActive', { isActive: true });
    } else if (paginationDto.status === 'inactive') {
      queryBuilder.andWhere('article.isActive = :isActive', { isActive: false });
    }

    // Add sorting and pagination
    queryBuilder
      .orderBy(`article.${paginationOptions.sortBy}`, paginationOptions.sortOrder)
      .skip(this.paginationService.getSkip(paginationOptions.page, paginationOptions.limit))
      .take(paginationOptions.limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return this.paginationService.createPaginatedResponse(data, total, paginationOptions);
  }

  async findOne(id: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: [
        'articleFournisseurs',
        'articleFournisseurs.fournisseur',
        'createdBy',
        'updatedBy'
      ]
    });

    if (!article) {
      throw new NotFoundException('Article non trouvé');
    }

    return article;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto): Promise<Article> {
    const article = await this.findOne(id);

    // Check if code is being changed and if it already exists
    if (updateArticleDto.codeArticle && updateArticleDto.codeArticle !== article.codeArticle) {
      const existingArticle = await this.articleRepository.findOne({
        where: { codeArticle: updateArticleDto.codeArticle }
      });

      if (existingArticle) {
        throw new ConflictException('Un article avec ce code existe déjà');
      }
    }

    Object.assign(article, updateArticleDto);
    return this.articleRepository.save(article);
  }

  async remove(id: string): Promise<void> {
    const article = await this.findOne(id);
    article.isActive = false;
    await this.articleRepository.save(article);
  }

  async reactivate(id: string): Promise<Article> {
    const article = await this.findOne(id);
    article.isActive = true;
    return this.articleRepository.save(article);
  }

  // Article-Fournisseur relationship methods
  async addFournisseur(articleId: string, createArticleFournisseurDto: CreateArticleFournisseurDto): Promise<ArticleFournisseur> {
    const article = await this.findOne(articleId);
    const fournisseur = await this.fournisseurRepository.findOne({
      where: { id: createArticleFournisseurDto.fournisseurId }
    });

    if (!fournisseur) {
      throw new NotFoundException('Fournisseur non trouvé');
    }

    // Check if relationship already exists
    const existingRelation = await this.articleFournisseurRepository.findOne({
      where: {
        articleId: articleId,
        fournisseurId: createArticleFournisseurDto.fournisseurId
      }
    });

    if (existingRelation) {
      throw new ConflictException('Ce fournisseur est déjà associé à cet article');
    }

    const articleFournisseur = this.articleFournisseurRepository.create({
      ...createArticleFournisseurDto,
      articleId: articleId
    });

    return this.articleFournisseurRepository.save(articleFournisseur);
  }

  async updateFournisseur(
    articleId: string, 
    fournisseurInfoId: string, 
    updateData: Partial<CreateArticleFournisseurDto>
  ): Promise<ArticleFournisseur> {
    const articleFournisseur = await this.articleFournisseurRepository.findOne({
      where: { id: fournisseurInfoId, articleId: articleId },
      relations: ['article', 'fournisseur']
    });

    if (!articleFournisseur) {
      throw new NotFoundException('Relation article-fournisseur non trouvée');
    }

    Object.assign(articleFournisseur, updateData);
    return this.articleFournisseurRepository.save(articleFournisseur);
  }

  async removeFournisseur(articleId: string, fournisseurInfoId: string): Promise<void> {
    const articleFournisseur = await this.articleFournisseurRepository.findOne({
      where: { id: fournisseurInfoId, articleId: articleId }
    });

    if (!articleFournisseur) {
      throw new NotFoundException('Relation article-fournisseur non trouvée');
    }

    await this.articleFournisseurRepository.remove(articleFournisseur);
  }

  // Get article categories
  getCategories(): ArticleCategory[] {
    return Object.values(ArticleCategory);
  }

  // Search articles for autocomplete
  async searchArticles(query: string, limit: number = 10): Promise<Article[]> {
    return this.articleRepository
      .createQueryBuilder('article')
      .where('article.isActive = :isActive', { isActive: true })
      .andWhere('(article.codeArticle ILIKE :search OR article.designation ILIKE :search)', {
        search: `%${query}%`
      })
      .orderBy('article.designation', 'ASC')
      .limit(limit)
      .getMany();
  }
}