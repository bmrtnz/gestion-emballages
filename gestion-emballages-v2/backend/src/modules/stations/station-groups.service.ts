import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StationGroup } from './entities/station-group.entity';
import { Station } from './entities/station.entity';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationService, PaginationOptions } from '@common/services/pagination.service';

export interface CreateStationGroupDto {
  nom: string;
  description?: string;
  contactPrincipal?: {
    nom?: string;
    poste?: string;
    telephone?: string;
    email?: string;
  };
}

export interface UpdateStationGroupDto {
  nom?: string;
  description?: string;
  contactPrincipal?: {
    nom?: string;
    poste?: string;
    telephone?: string;
    email?: string;
  };
}

@Injectable()
export class StationGroupsService {
  constructor(
    @InjectRepository(StationGroup)
    private stationGroupRepository: Repository<StationGroup>,
    @InjectRepository(Station)
    private stationRepository: Repository<Station>,
    private paginationService: PaginationService,
  ) {}

  async create(createDto: CreateStationGroupDto): Promise<StationGroup> {
    // Check if name already exists
    const existingGroup = await this.stationGroupRepository.findOne({
      where: { nom: createDto.nom },
    });

    if (existingGroup) {
      throw new ConflictException('Un groupe de stations avec ce nom existe déjà');
    }

    const stationGroup = this.stationGroupRepository.create({
      ...createDto,
      contactPrincipal: createDto.contactPrincipal || {},
    });

    return this.stationGroupRepository.save(stationGroup);
  }

  async findAll(paginationDto: PaginationDto) {
    const paginationOptions = this.paginationService.validatePaginationOptions({
      page: paginationDto.page || 1,
      limit: paginationDto.limit || 10,
      sortBy: paginationDto.sortBy || 'nom',
      sortOrder: paginationDto.sortOrder || 'ASC',
    });

    const queryBuilder = this.stationGroupRepository
      .createQueryBuilder('groupe')
      .leftJoinAndSelect('groupe.stations', 'stations', 'stations.isActive = :isActive', {
        isActive: true,
      });

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(groupe.nom ILIKE :search OR groupe.description ILIKE :search)',
        { search: `%${paginationDto.search}%` },
      );
    }

    // Add status filter
    if (paginationDto.status === 'active') {
      queryBuilder.andWhere('groupe.isActive = :isActive', { isActive: true });
    } else if (paginationDto.status === 'inactive') {
      queryBuilder.andWhere('groupe.isActive = :isActive', { isActive: false });
    }

    // Add sorting and pagination
    queryBuilder
      .orderBy(`groupe.${paginationOptions.sortBy}`, paginationOptions.sortOrder)
      .skip(this.paginationService.getSkip(paginationOptions.page, paginationOptions.limit))
      .take(paginationOptions.limit);

    const [stationGroups, total] = await queryBuilder.getManyAndCount();

    return this.paginationService.createPaginatedResponse(
      stationGroups,
      total,
      paginationOptions,
    );
  }

  async findOne(id: string): Promise<StationGroup> {
    const stationGroup = await this.stationGroupRepository.findOne({
      where: { id },
      relations: ['stations', 'stations.contacts'],
    });

    if (!stationGroup) {
      throw new NotFoundException('Groupe de stations non trouvé');
    }

    return stationGroup;
  }

  async update(id: string, updateDto: UpdateStationGroupDto): Promise<StationGroup> {
    const stationGroup = await this.findOne(id);

    // Check if name is being changed and if it already exists
    if (updateDto.nom && updateDto.nom !== stationGroup.nom) {
      const existingGroup = await this.stationGroupRepository.findOne({
        where: { nom: updateDto.nom },
      });

      if (existingGroup) {
        throw new ConflictException('Un groupe de stations avec ce nom existe déjà');
      }
    }

    // Merge contact principal data
    if (updateDto.contactPrincipal) {
      updateDto.contactPrincipal = {
        ...stationGroup.contactPrincipal,
        ...updateDto.contactPrincipal,
      };
    }

    Object.assign(stationGroup, updateDto);
    return this.stationGroupRepository.save(stationGroup);
  }

  async remove(id: string): Promise<void> {
    const stationGroup = await this.findOne(id);
    stationGroup.isActive = false;
    await this.stationGroupRepository.save(stationGroup);
  }

  async reactivate(id: string): Promise<StationGroup> {
    const stationGroup = await this.findOne(id);
    stationGroup.isActive = true;
    return this.stationGroupRepository.save(stationGroup);
  }

  async getStationsInGroup(groupId: string) {
    const stationGroup = await this.stationGroupRepository.findOne({
      where: { id: groupId },
      relations: ['stations', 'stations.contacts'],
    });

    if (!stationGroup) {
      throw new NotFoundException('Groupe de stations non trouvé');
    }

    return stationGroup.stations.filter((station) => station.isActive);
  }

  async getIndependentStations(): Promise<Station[]> {
    return this.stationRepository.find({
      where: { 
        groupeId: null, // Explicitly null - independent stations
        isActive: true 
      },
      relations: ['contacts'],
      order: { nom: 'ASC' },
    });
  }

  async getStationStatistics(): Promise<{
    totalStations: number;
    groupedStations: number;
    independentStations: number;
    totalGroups: number;
    averageStationsPerGroup: number;
  }> {
    const [totalStations, independentStations, totalGroups] = await Promise.all([
      this.stationRepository.count({ where: { isActive: true } }),
      this.stationRepository.count({ where: { groupeId: null, isActive: true } }),
      this.stationGroupRepository.count({ where: { isActive: true } }),
    ]);

    const groupedStations = totalStations - independentStations;
    const averageStationsPerGroup = totalGroups > 0 ? Math.round((groupedStations / totalGroups) * 10) / 10 : 0;

    return {
      totalStations,
      groupedStations,
      independentStations,
      totalGroups,
      averageStationsPerGroup,
    };
  }
}