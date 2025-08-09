import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not } from 'typeorm';
import { Platform } from './entities/platform.entity';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationService, PaginationOptions } from '@common/services/pagination.service';

@Injectable()
export class PlatformsService {
  constructor(
    @InjectRepository(Platform)
    private platformRepository: Repository<Platform>,
    private paginationService: PaginationService,
  ) {}

  async create(createPlatformDto: CreatePlatformDto, userId: string): Promise<Platform> {

    const platform = this.platformRepository.create({
      ...createPlatformDto,
      createdById: userId,
      updatedById: userId,
    });

    return await this.platformRepository.save(platform);
  }

  async findAll(paginationDto: PaginationDto) {
    const paginationOptions = this.paginationService.validatePaginationOptions({
      page: paginationDto.page || 1,
      limit: paginationDto.limit || 10,
      sortBy: paginationDto.sortBy || 'name',
      sortOrder: paginationDto.sortOrder || 'ASC'
    });

    const queryBuilder = this.platformRepository
      .createQueryBuilder('platform');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(platform.name ILIKE :search OR platform.siret ILIKE :search OR platform.type ILIKE :search)',
        { search: `%${paginationDto.search}%` },
      );
    }

    // Add status filter
    if (paginationDto.status === 'active') {
      queryBuilder.andWhere('platform.isActive = :isActive', { isActive: true });
    } else if (paginationDto.status === 'inactive') {
      queryBuilder.andWhere('platform.isActive = :isActive', { isActive: false });
    }

    // Add specialties filter
    if (paginationDto['specialties']) {
      queryBuilder.andWhere(':specialties = ANY(platform.specialties)', { 
        specialties: paginationDto['specialties'] 
      });
    }

    // Add sorting and pagination
    queryBuilder
      .orderBy(`platform.${paginationOptions.sortBy}`, paginationOptions.sortOrder)
      .skip(this.paginationService.getSkip(paginationOptions.page, paginationOptions.limit))
      .take(paginationOptions.limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return this.paginationService.createPaginatedResponse(data, total, paginationOptions);
  }

  async findOne(id: string): Promise<Platform> {
    const platform = await this.platformRepository.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy'],
    });

    if (!platform) {
      throw new NotFoundException(`Plateforme avec l'ID ${id} non trouvée`);
    }

    return platform;
  }

  async update(id: string, updatePlatformDto: UpdatePlatformDto, userId: string): Promise<Platform> {
    const platform = await this.findOne(id);

    // Platform update logic

    Object.assign(platform, updatePlatformDto, { updatedById: userId });
    return await this.platformRepository.save(platform);
  }

  async remove(id: string, userId: string): Promise<void> {
    const platform = await this.findOne(id);
    
    // Soft delete
    platform.isActive = false;
    platform.updatedById = userId;
    
    await this.platformRepository.save(platform);
  }

  // PlatformSite methods removed - use PlatformContacts instead

  async findActivePlatforms(): Promise<Platform[]> {
    return await this.platformRepository.find({
      where: { isActive: true },
      relations: ['contacts'],
      order: { name: 'ASC' },
    });
  }
}