import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from './entities/product.entity';
import { ProductSupplier } from './entities/product-supplier.entity';
import { Supplier } from '@modules/suppliers/entities/supplier.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductSupplierDto } from './dto/create-product-supplier.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationService, PaginationOptions } from '@common/services/pagination.service';
import { ProductCategory } from '@common/enums/product-category.enum';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private articleRepository: Repository<Product>,
    @InjectRepository(ProductSupplier)
    private articleFournisseurRepository: Repository<ProductSupplier>,
    @InjectRepository(Supplier)
    private fournisseurRepository: Repository<Supplier>,
    private paginationService: PaginationService,
  ) {}

  async create(CreateProductDto: CreateProductDto): Promise<Product> {
    // Check if Product code already exists
    const existingArticle = await this.articleRepository.findOne({
      where: { productCode: CreateProductDto.productCode }
    });

    if (existingArticle) {
      throw new ConflictException('Un Product avec ce code existe déjà');
    }

    const Product = this.articleRepository.create(CreateProductDto);
    return this.articleRepository.save(Product);
  }

  async findAll(paginationDto: PaginationDto) {
    const paginationOptions = this.paginationService.validatePaginationOptions({
      page: paginationDto.page || 1,
      limit: paginationDto.limit || 10,
      sortBy: paginationDto.sortBy || 'createdAt',
      sortOrder: paginationDto.sortOrder || 'DESC'
    });

    const queryBuilder = this.articleRepository
      .createQueryBuilder('Product')
      .leftJoinAndSelect('Product.articleFournisseurs', 'ProductSupplier')
      .leftJoinAndSelect('ProductSupplier.Supplier', 'Supplier');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(Product.codeArticle ILIKE :search OR Product.designation ILIKE :search OR Supplier.name ILIKE :search)',
        { search: `%${paginationDto.search}%` }
      );
    }

    // Add status filter
    if (paginationDto.status === 'active') {
      queryBuilder.andWhere('Product.isActive = :isActive', { isActive: true });
    } else if (paginationDto.status === 'inactive') {
      queryBuilder.andWhere('Product.isActive = :isActive', { isActive: false });
    }

    // Add sorting and pagination
    queryBuilder
      .orderBy(`Product.${paginationOptions.sortBy}`, paginationOptions.sortOrder)
      .skip(this.paginationService.getSkip(paginationOptions.page, paginationOptions.limit))
      .take(paginationOptions.limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return this.paginationService.createPaginatedResponse(data, total, paginationOptions);
  }

  async findOne(id: string): Promise<Product> {
    const Product = await this.articleRepository.findOne({
      where: { id },
      relations: [
        'articleFournisseurs',
        'articleFournisseurs.Supplier',
        'createdBy',
        'updatedBy'
      ]
    });

    if (!Product) {
      throw new NotFoundException('Product non trouvé');
    }

    return Product;
  }

  async update(id: string, UpdateProductDto: UpdateProductDto): Promise<Product> {
    const Product = await this.findOne(id);

    // Check if code is being changed and if it already exists
    if (UpdateProductDto.productCode && UpdateProductDto.productCode !== Product.productCode) {
      const existingArticle = await this.articleRepository.findOne({
        where: { productCode: UpdateProductDto.productCode }
      });

      if (existingArticle) {
        throw new ConflictException('Un Product avec ce code existe déjà');
      }
    }

    Object.assign(Product, UpdateProductDto);
    return this.articleRepository.save(Product);
  }

  async remove(id: string): Promise<void> {
    const Product = await this.findOne(id);
    Product.isActive = false;
    await this.articleRepository.save(Product);
  }

  async reactivate(id: string): Promise<Product> {
    const Product = await this.findOne(id);
    Product.isActive = true;
    return this.articleRepository.save(Product);
  }

  // Product-Supplier relationship methods
  async addFournisseur(productId: string, CreateProductSupplierDto: CreateProductSupplierDto): Promise<ProductSupplier> {
    const Product = await this.findOne(productId);
    const Supplier = await this.fournisseurRepository.findOne({
      where: { id: CreateProductSupplierDto.supplierId }
    });

    if (!Supplier) {
      throw new NotFoundException('Supplier non trouvé');
    }

    // Check if relationship already exists
    const existingRelation = await this.articleFournisseurRepository.findOne({
      where: {
        productId: productId,
        supplierId: CreateProductSupplierDto.supplierId
      }
    });

    if (existingRelation) {
      throw new ConflictException('Ce Supplier est déjà associé à cet Product');
    }

    const ProductSupplier = this.articleFournisseurRepository.create({
      ...CreateProductSupplierDto,
      productId: productId
    });

    return this.articleFournisseurRepository.save(ProductSupplier);
  }

  async updateFournisseur(
    productId: string, 
    productSupplierInfoId: string, 
    updateData: Partial<CreateProductSupplierDto>
  ): Promise<ProductSupplier> {
    const ProductSupplier = await this.articleFournisseurRepository.findOne({
      where: { id: productSupplierInfoId, productId: productId },
      relations: ['product', 'supplier']
    });

    if (!ProductSupplier) {
      throw new NotFoundException('Relation Product-Supplier non trouvée');
    }

    Object.assign(ProductSupplier, updateData);
    return this.articleFournisseurRepository.save(ProductSupplier);
  }

  async removeFournisseur(productId: string, productSupplierInfoId: string): Promise<void> {
    const ProductSupplier = await this.articleFournisseurRepository.findOne({
      where: { id: productSupplierInfoId, productId: productId }
    });

    if (!ProductSupplier) {
      throw new NotFoundException('Relation Product-Supplier non trouvée');
    }

    await this.articleFournisseurRepository.remove(ProductSupplier);
  }

  // Get Product categories
  getCategories(): ProductCategory[] {
    return Object.values(ProductCategory);
  }

  // Search articles for autocomplete
  async searchArticles(query: string, limit: number = 10): Promise<Product[]> {
    return this.articleRepository
      .createQueryBuilder('Product')
      .where('Product.isActive = :isActive', { isActive: true })
      .andWhere('(Product.productCode ILIKE :search OR Product.description ILIKE :search)', {
        search: `%${query}%`
      })
      .orderBy('Product.designation', 'ASC')
      .limit(limit)
      .getMany();
  }
}