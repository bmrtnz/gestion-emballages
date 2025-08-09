import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Station } from './entities/station.entity';
import { StationGroup } from './entities/station-group.entity';
import { StationContact } from './entities/station-contact.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationService, PaginationOptions } from '@common/services/pagination.service';

@Injectable()
export class StationsService {
  constructor(
    @InjectRepository(Station)
    private stationRepository: Repository<Station>,
    @InjectRepository(StationGroup)
    private stationGroupRepository: Repository<StationGroup>,
    @InjectRepository(StationContact)
    private stationContactRepository: Repository<StationContact>,
    private paginationService: PaginationService,
  ) {}

  async create(createStationDto: CreateStationDto): Promise<Station> {
    const station = this.stationRepository.create(createStationDto);
    return this.stationRepository.save(station);
  }

  async findAll(paginationDto: PaginationDto) {
    const paginationOptions = this.paginationService.validatePaginationOptions({
      page: paginationDto.page || 1,
      limit: paginationDto.limit || 10,
      sortBy: paginationDto.sortBy || 'name',
      sortOrder: paginationDto.sortOrder || 'ASC'
    });

    const queryBuilder = this.stationRepository
      .createQueryBuilder('station')
      .leftJoinAndSelect('station.groupe', 'groupe')
      .leftJoinAndSelect('station.contacts', 'contacts', 'contacts.isActive = :contactsActive', {
        contactsActive: true,
      });

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(station.name ILIKE :search OR station.internalId ILIKE :search OR groupe.name ILIKE :search)',
        { search: `%${paginationDto.search}%` }
      );
    }

    // Add station group filter
    if (paginationDto['groupeId']) {
      queryBuilder.andWhere('station.groupId = :groupId', { 
        groupId: paginationDto['groupeId'] 
      });
    }

    // Add status filter
    if (paginationDto.status === 'active') {
      queryBuilder.andWhere('station.isActive = :isActive', { isActive: true });
    } else if (paginationDto.status === 'inactive') {
      queryBuilder.andWhere('station.isActive = :isActive', { isActive: false });
    }

    // Add sorting and pagination
    queryBuilder
      .orderBy(`station.${paginationOptions.sortBy}`, paginationOptions.sortOrder)
      .skip(this.paginationService.getSkip(paginationOptions.page, paginationOptions.limit))
      .take(paginationOptions.limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return this.paginationService.createPaginatedResponse(data, total, paginationOptions);
  }

  async findOne(id: string): Promise<Station> {
    const station = await this.stationRepository.findOne({
      where: { id },
      relations: ['groupe', 'contacts', 'createdBy', 'updatedBy']
    });

    if (!station) {
      throw new NotFoundException('Station non trouvée');
    }

    return station;
  }

  async update(id: string, updateStationDto: UpdateStationDto): Promise<Station> {
    const station = await this.findOne(id);
    Object.assign(station, updateStationDto);
    return this.stationRepository.save(station);
  }

  async remove(id: string): Promise<void> {
    const station = await this.findOne(id);
    station.isActive = false;
    await this.stationRepository.save(station);
  }

  async reactivate(id: string): Promise<Station> {
    const station = await this.findOne(id);
    station.isActive = true;
    return this.stationRepository.save(station);
  }

  // Station Group methods
  async assignToGroup(stationId: string, groupId: string | null): Promise<Station> {
    const station = await this.findOne(stationId);
    
    if (groupId) {
      const groupe = await this.stationGroupRepository.findOne({
        where: { id: groupId, isActive: true },
      });
      
      if (!groupe) {
        throw new NotFoundException('Groupe de stations non trouvé');
      }
    }
    
    station.groupId = groupId;
    return this.stationRepository.save(station);
  }

  async getStationsByGroup(): Promise<{ groupe: StationGroup | null; stations: Station[] }[]> {
    const stations = await this.stationRepository.find({
      where: { isActive: true },
      relations: ['groupe'],
      order: { name: 'ASC' },
    });

    // Group stations by their groupe
    const grouped = new Map();
    
    for (const station of stations) {
      const groupeKey = station.groupe?.id || 'ungrouped';
      if (!grouped.has(groupeKey)) {
        grouped.set(groupeKey, {
          groupe: station.groupe || null,
          stations: [],
        });
      }
      grouped.get(groupeKey).stations.push(station);
    }

    return Array.from(grouped.values()).sort((a, b) => {
      // Ungrouped stations come first
      if (!a.groupe && b.groupe) return -1;
      if (a.groupe && !b.groupe) return 1;
      if (!a.groupe && !b.groupe) return 0;
      return a.groupe.name.localeCompare(b.groupe.name);
    });
  }

  // Utility methods for user selection
  async findActiveStations(): Promise<Station[]> {
    return this.stationRepository.find({
      where: { isActive: true },
      relations: ['groupe'],
      order: { name: 'ASC' },
      select: ['id', 'name', 'internalId', 'groupId']
    });
  }

  async findStationsInGroup(groupId: string): Promise<Station[]> {
    return this.stationRepository.find({
      where: { groupId, isActive: true },
      relations: ['contacts'],
      order: { name: 'ASC' },
    });
  }
}