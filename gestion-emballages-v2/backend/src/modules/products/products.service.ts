import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from './entities/product.entity';
import { ProductSupplier } from './entities/product-supplier.entity';
import { Supplier } from '@modules/suppliers/entities/supplier.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductSupplierDto } from './dto/create-product-supplier.dto';
import { UpdateProductSupplierDto } from './dto/update-product-supplier.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationService } from '@common/services/pagination.service';
import { ProductCategory } from '@common/enums/product-category.enum';
import { ConditioningUnit } from '@common/enums/conditioning-unit.enum';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductSupplier)
    private productSupplierRepository: Repository<ProductSupplier>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    private paginationService: PaginationService
  ) {}

  async create(CreateProductDto: CreateProductDto): Promise<Product> {
    // Check if Product code already exists
    const existingProduct = await this.productRepository.findOne({
      where: { productCode: CreateProductDto.productCode },
    });

    if (existingProduct) {
      throw new ConflictException('A product with this code already exists');
    }

    const product = this.productRepository.create(CreateProductDto);
    return this.productRepository.save(product);
  }

  async findAll(paginationDto: PaginationDto) {
    const paginationOptions = this.paginationService.validatePaginationOptions({
      page: paginationDto.page || 1,
      limit: paginationDto.limit || 10,
      sortBy: paginationDto.sortBy || 'createdAt',
      sortOrder: paginationDto.sortOrder || 'DESC',
    });

    const queryBuilder = this.productRepository
      .createQueryBuilder('Product')
      .leftJoinAndSelect('Product.productSuppliers', 'ProductSupplier')
      .leftJoinAndSelect('ProductSupplier.supplier', 'Supplier');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(Product.productCode ILIKE :search OR Product.description ILIKE :search OR Supplier.name ILIKE :search)',
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
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['productSuppliers', 'productSuppliers.supplier', 'createdBy', 'updatedBy'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, UpdateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    // Check if code is being changed and if it already exists
    if (UpdateProductDto.productCode && UpdateProductDto.productCode !== product.productCode) {
      const existingProduct = await this.productRepository.findOne({
        where: { productCode: UpdateProductDto.productCode },
      });

      if (existingProduct) {
        throw new ConflictException('A product with this code already exists');
      }
    }

    Object.assign(product, UpdateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    product.isActive = false;
    await this.productRepository.save(product);
  }

  async reactivate(id: string): Promise<Product> {
    const product = await this.findOne(id);
    product.isActive = true;
    return this.productRepository.save(product);
  }

  // Product-Supplier relationship methods
  async addSupplier(productId: string, CreateProductSupplierDto: CreateProductSupplierDto): Promise<ProductSupplier> {
    await this.findOne(productId);
    const supplier = await this.supplierRepository.findOne({
      where: { id: CreateProductSupplierDto.supplierId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Check if relationship already exists
    const existingRelation = await this.productSupplierRepository.findOne({
      where: {
        productId: productId,
        supplierId: CreateProductSupplierDto.supplierId,
      },
    });

    if (existingRelation) {
      throw new ConflictException('This supplier is already associated with this product');
    }

    const productSupplier = this.productSupplierRepository.create({
      ...CreateProductSupplierDto,
      productId: productId,
    });

    return this.productSupplierRepository.save(productSupplier);
  }

  async updateSupplier(
    productId: string,
    productSupplierInfoId: string,
    updateData: UpdateProductSupplierDto
  ): Promise<ProductSupplier> {
    const productSupplier = await this.productSupplierRepository.findOne({
      where: { id: productSupplierInfoId, productId: productId },
      relations: ['product', 'supplier'],
    });

    if (!productSupplier) {
      throw new NotFoundException('Product-Supplier relationship not found');
    }

    Object.assign(productSupplier, updateData);
    return this.productSupplierRepository.save(productSupplier);
  }

  async removeSupplier(productId: string, productSupplierInfoId: string): Promise<void> {
    const productSupplier = await this.productSupplierRepository.findOne({
      where: { id: productSupplierInfoId, productId: productId },
    });

    if (!productSupplier) {
      throw new NotFoundException('Product-Supplier relationship not found');
    }

    await this.productSupplierRepository.remove(productSupplier);
  }

  // Get Product categories
  getCategories(): ProductCategory[] {
    return Object.values(ProductCategory);
  }

  // Get conditioning units
  getConditioningUnits(): ConditioningUnit[] {
    return Object.values(ConditioningUnit);
  }

  // Search products for autocomplete
  async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('Product')
      .where('Product.isActive = :isActive', { isActive: true })
      .andWhere('(Product.productCode ILIKE :search OR Product.description ILIKE :search)', {
        search: `%${query}%`,
      })
      .orderBy('Product.description', 'ASC')
      .limit(limit)
      .getMany();
  }
}
