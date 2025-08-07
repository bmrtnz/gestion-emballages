import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not } from 'typeorm';
import { Platform } from './entities/platform.entity';
import { PlatformSite } from './entities/platform-site.entity';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { CreatePlatformSiteDto } from './dto/create-platform-site.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationService, PaginationOptions } from '@common/services/pagination.service';

@Injectable()
export class PlatformsService {
  constructor(
    @InjectRepository(Platform)
    private platformRepository: Repository<Platform>,
    @InjectRepository(PlatformSite)
    private platformSiteRepository: Repository<PlatformSite>,
    private paginationService: PaginationService,
  ) {}

  async create(createPlatformDto: CreatePlatformDto, userId: string): Promise<Platform> {
    // Check if platform with same SIRET already exists
    if (createPlatformDto.siret) {
      const existingPlatform = await this.platformRepository.findOne({
        where: { siret: createPlatformDto.siret },
      });
      if (existingPlatform) {
        throw new ConflictException('Une plateforme avec ce SIRET existe déjà');
      }
    }

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
      sortBy: paginationDto.sortBy || 'nom',
      sortOrder: paginationDto.sortOrder || 'ASC'
    });

    const queryBuilder = this.platformRepository
      .createQueryBuilder('platform')
      .leftJoinAndSelect('platform.sites', 'sites');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(platform.nom ILIKE :search OR platform.siret ILIKE :search OR platform.type ILIKE :search)',
        { search: `%${paginationDto.search}%` },
      );
    }

    // Add status filter
    if (paginationDto.status === 'active') {
      queryBuilder.andWhere('platform.isActive = :isActive', { isActive: true });
    } else if (paginationDto.status === 'inactive') {
      queryBuilder.andWhere('platform.isActive = :isActive', { isActive: false });
    }

    // Add specialite filter
    if (paginationDto.specialite) {
      queryBuilder.andWhere(':specialite = ANY(platform.specialites)', { 
        specialite: paginationDto.specialite 
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
      relations: ['sites', 'createdBy', 'updatedBy'],
    });

    if (!platform) {
      throw new NotFoundException(`Plateforme avec l'ID ${id} non trouvée`);
    }

    return platform;
  }

  async update(id: string, updatePlatformDto: UpdatePlatformDto, userId: string): Promise<Platform> {
    const platform = await this.findOne(id);

    // Check SIRET uniqueness if it's being updated
    if (updatePlatformDto.siret && updatePlatformDto.siret !== platform.siret) {
      const existingPlatform = await this.platformRepository.findOne({
        where: { siret: updatePlatformDto.siret },
      });
      if (existingPlatform) {
        throw new ConflictException('Une plateforme avec ce SIRET existe déjà');
      }
    }

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

  async createSite(platformId: string, createSiteDto: CreatePlatformSiteDto): Promise<PlatformSite> {
    const platform = await this.findOne(platformId);

    // If this is set as principal, unset other principal sites
    if (createSiteDto.isPrincipal) {
      await this.platformSiteRepository.update(
        { platformId },
        { isPrincipal: false },
      );
    }

    const site = this.platformSiteRepository.create({
      ...createSiteDto,
      platformId,
    });

    return await this.platformSiteRepository.save(site);
  }

  async updateSite(platformId: string, siteId: string, updateSiteDto: CreatePlatformSiteDto): Promise<PlatformSite> {
    const site = await this.platformSiteRepository.findOne({
      where: { id: siteId, platformId },
    });

    if (!site) {
      throw new NotFoundException(`Site avec l'ID ${siteId} non trouvé`);
    }

    // If this is set as principal, unset other principal sites
    if (updateSiteDto.isPrincipal && !site.isPrincipal) {
      await this.platformSiteRepository.update(
        { platformId, id: Not(siteId) },
        { isPrincipal: false },
      );
    }

    Object.assign(site, updateSiteDto);
    return await this.platformSiteRepository.save(site);
  }

  async removeSite(platformId: string, siteId: string): Promise<void> {
    const site = await this.platformSiteRepository.findOne({
      where: { id: siteId, platformId },
    });

    if (!site) {
      throw new NotFoundException(`Site avec l'ID ${siteId} non trouvé`);
    }

    // Soft delete
    site.isActive = false;
    await this.platformSiteRepository.save(site);
  }

  async findActivePlatforms(): Promise<Platform[]> {
    return await this.platformRepository.find({
      where: { isActive: true },
      relations: ['sites'],
      order: { nom: 'ASC' },
    });
  }
}