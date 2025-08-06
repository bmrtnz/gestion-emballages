import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Fournisseur } from './entities/fournisseur.entity';
import { FournisseurSite } from './entities/fournisseur-site.entity';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
import { UpdateFournisseurDto } from './dto/update-fournisseur.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationService, PaginationOptions } from '@common/services/pagination.service';

@Injectable()
export class FournisseursService {
  constructor(
    @InjectRepository(Fournisseur)
    private fournisseurRepository: Repository<Fournisseur>,
    @InjectRepository(FournisseurSite)
    private fournisseurSiteRepository: Repository<FournisseurSite>,
    private paginationService: PaginationService,
  ) {}

  async create(createFournisseurDto: CreateFournisseurDto): Promise<Fournisseur> {
    const fournisseur = this.fournisseurRepository.create(createFournisseurDto);
    return this.fournisseurRepository.save(fournisseur);
  }

  async findAll(paginationDto: PaginationDto) {
    const paginationOptions = this.paginationService.validatePaginationOptions({
      page: paginationDto.page || 1,
      limit: paginationDto.limit || 20,
      sortBy: paginationDto.sortBy || 'nom',
      sortOrder: paginationDto.sortOrder || 'ASC'
    });

    const queryBuilder = this.fournisseurRepository
      .createQueryBuilder('fournisseur')
      .leftJoinAndSelect('fournisseur.sites', 'sites');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(fournisseur.nom ILIKE :search OR fournisseur.siret ILIKE :search OR fournisseur.type ILIKE :search)',
        { search: `%${paginationDto.search}%` }
      );
    }

    // Add status filter
    if (paginationDto.status === 'active') {
      queryBuilder.andWhere('fournisseur.isActive = :isActive', { isActive: true });
    } else if (paginationDto.status === 'inactive') {
      queryBuilder.andWhere('fournisseur.isActive = :isActive', { isActive: false });
    }

    // Add sorting and pagination
    queryBuilder
      .orderBy(`fournisseur.${paginationOptions.sortBy}`, paginationOptions.sortOrder)
      .skip(this.paginationService.getSkip(paginationOptions.page, paginationOptions.limit))
      .take(paginationOptions.limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return this.paginationService.createPaginatedResponse(data, total, paginationOptions);
  }

  async findOne(id: string): Promise<Fournisseur> {
    const fournisseur = await this.fournisseurRepository.findOne({
      where: { id },
      relations: ['sites', 'users', 'createdBy', 'updatedBy']
    });

    if (!fournisseur) {
      throw new NotFoundException('Fournisseur non trouvé');
    }

    return fournisseur;
  }

  async update(id: string, updateFournisseurDto: UpdateFournisseurDto): Promise<Fournisseur> {
    const fournisseur = await this.findOne(id);
    Object.assign(fournisseur, updateFournisseurDto);
    return this.fournisseurRepository.save(fournisseur);
  }

  async remove(id: string): Promise<void> {
    const fournisseur = await this.findOne(id);
    fournisseur.isActive = false;
    await this.fournisseurRepository.save(fournisseur);
  }

  async reactivate(id: string): Promise<Fournisseur> {
    const fournisseur = await this.findOne(id);
    fournisseur.isActive = true;
    return this.fournisseurRepository.save(fournisseur);
  }

  // Utility methods for user selection
  async findActiveFournisseurs(): Promise<Fournisseur[]> {
    return this.fournisseurRepository.find({
      where: { isActive: true },
      order: { nom: 'ASC' },
      select: ['id', 'nom', 'siret', 'type']
    });
  }
}