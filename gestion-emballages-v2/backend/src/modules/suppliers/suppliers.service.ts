import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Supplier } from './entities/supplier.entity';
import { SupplierSite } from './entities/supplier-site.entity';
import { CreateSupplierDto } from './dto/create-Supplier.dto';
import { UpdateSupplierDto } from './dto/update-Supplier.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationOptions, PaginationService } from '@common/services/pagination.service';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private fournisseurRepository: Repository<Supplier>,
    @InjectRepository(SupplierSite)
    private fournisseurSiteRepository: Repository<SupplierSite>,
    private paginationService: PaginationService
  ) {}

  async create(CreateSupplierDto: CreateSupplierDto): Promise<Supplier> {
    const Supplier = this.fournisseurRepository.create(CreateSupplierDto);
    return this.fournisseurRepository.save(Supplier);
  }

  async findAll(paginationDto: PaginationDto) {
    const paginationOptions = this.paginationService.validatePaginationOptions({
      page: paginationDto.page || 1,
      limit: paginationDto.limit || 10,
      sortBy: paginationDto.sortBy || 'name',
      sortOrder: paginationDto.sortOrder || 'ASC',
    });

    const queryBuilder = this.fournisseurRepository
      .createQueryBuilder('Supplier')
      .leftJoinAndSelect('Supplier.sites', 'sites');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(Supplier.name ILIKE :search OR Supplier.siret ILIKE :search OR Supplier.type ILIKE :search)',
        { search: `%${paginationDto.search}%` }
      );
    }

    // Add status filter
    if (paginationDto.status === 'active') {
      queryBuilder.andWhere('Supplier.isActive = :isActive', { isActive: true });
    } else if (paginationDto.status === 'inactive') {
      queryBuilder.andWhere('Supplier.isActive = :isActive', { isActive: false });
    }

    // Add sorting and pagination
    queryBuilder
      .orderBy(`Supplier.${paginationOptions.sortBy}`, paginationOptions.sortOrder)
      .skip(this.paginationService.getSkip(paginationOptions.page, paginationOptions.limit))
      .take(paginationOptions.limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return this.paginationService.createPaginatedResponse(data, total, paginationOptions);
  }

  async findOne(id: string): Promise<Supplier> {
    const Supplier = await this.fournisseurRepository.findOne({
      where: { id },
      relations: ['sites', 'users', 'createdBy', 'updatedBy'],
    });

    if (!Supplier) {
      throw new NotFoundException('Supplier non trouvé');
    }

    return Supplier;
  }

  async update(id: string, UpdateSupplierDto: UpdateSupplierDto): Promise<Supplier> {
    const Supplier = await this.findOne(id);
    Object.assign(Supplier, UpdateSupplierDto);
    return this.fournisseurRepository.save(Supplier);
  }

  async remove(id: string): Promise<void> {
    const Supplier = await this.findOne(id);
    Supplier.isActive = false;
    await this.fournisseurRepository.save(Supplier);
  }

  async reactivate(id: string): Promise<Supplier> {
    const Supplier = await this.findOne(id);
    Supplier.isActive = true;
    return this.fournisseurRepository.save(Supplier);
  }

  // Utility methods for user selection
  async findActiveFournisseurs(): Promise<Supplier[]> {
    return this.fournisseurRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
      select: ['id', 'name', 'siret', 'specialties'],
    });
  }
}
