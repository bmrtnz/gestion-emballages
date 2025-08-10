import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StationGroup } from './entities/station-group.entity';
import { Station } from './entities/station.entity';
import { CreateStationGroupDto } from './dto/create-station-group.dto';
import { UpdateStationGroupDto } from './dto/update-station-group.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationOptions, PaginationService } from '@common/services/pagination.service';

@Injectable()
export class StationGroupsService {
  constructor(
    @InjectRepository(StationGroup)
    private stationGroupRepository: Repository<StationGroup>,
    @InjectRepository(Station)
    private stationRepository: Repository<Station>,
    private paginationService: PaginationService
  ) {}

  async create(createDto: CreateStationGroupDto): Promise<StationGroup> {
    // Check if name already exists
    const existingGroup = await this.stationGroupRepository.findOne({
      where: { name: createDto.name },
    });

    if (existingGroup) {
      throw new ConflictException('A station group with this name already exists');
    }

    const stationGroup = this.stationGroupRepository.create({
      ...createDto,
    });

    return this.stationGroupRepository.save(stationGroup);
  }

  async findAll(paginationDto: PaginationDto) {
    const paginationOptions = this.paginationService.validatePaginationOptions({
      page: paginationDto.page || 1,
      limit: paginationDto.limit || 10,
      sortBy: paginationDto.sortBy || 'name',
      sortOrder: paginationDto.sortOrder || 'ASC',
    });

    const queryBuilder = this.stationGroupRepository
      .createQueryBuilder('stationGroup')
      .leftJoinAndSelect('stationGroup.stations', 'stations', 'stations.isActive = :isActive', {
        isActive: true,
      });

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where('(stationGroup.name ILIKE :search OR stationGroup.description ILIKE :search)', {
        search: `%${paginationDto.search}%`,
      });
    }

    // Add status filter
    if (paginationDto.status === 'active') {
      queryBuilder.andWhere('stationGroup.isActive = :isActive', { isActive: true });
    } else if (paginationDto.status === 'inactive') {
      queryBuilder.andWhere('stationGroup.isActive = :isActive', { isActive: false });
    }

    // Add sorting and pagination
    queryBuilder
      .orderBy(`stationGroup.${paginationOptions.sortBy}`, paginationOptions.sortOrder)
      .skip(this.paginationService.getSkip(paginationOptions.page, paginationOptions.limit))
      .take(paginationOptions.limit);

    const [stationGroups, total] = await queryBuilder.getManyAndCount();

    return this.paginationService.createPaginatedResponse(stationGroups, total, paginationOptions);
  }

  async findOne(id: string): Promise<StationGroup> {
    const stationGroup = await this.stationGroupRepository.findOne({
      where: { id },
      relations: ['stations', 'stations.contacts'],
    });

    if (!stationGroup) {
      throw new NotFoundException('Station group not found');
    }

    return stationGroup;
  }

  async update(id: string, updateDto: UpdateStationGroupDto): Promise<StationGroup> {
    const stationGroup = await this.findOne(id);

    // Check if name is being changed and if it already exists
    if (updateDto.name && updateDto.name !== stationGroup.name) {
      const existingGroup = await this.stationGroupRepository.findOne({
        where: { name: updateDto.name },
      });

      if (existingGroup) {
        throw new ConflictException('A station group with this name already exists');
      }
    }

    Object.assign(stationGroup, updateDto);
    return this.stationGroupRepository.save(stationGroup);
  }

  async remove(id: string): Promise<void> {
    const stationGroup = await this.findOne(id);

    // Deactivate the station group
    stationGroup.isActive = false;
    await this.stationGroupRepository.save(stationGroup);

    // Cascade deactivation to all related stations
    await this.stationRepository.update({ stationGroupId: id, isActive: true }, { isActive: false });
  }

  async reactivate(id: string): Promise<StationGroup> {
    const stationGroup = await this.findOne(id);
    stationGroup.isActive = true;

    // Note: We don't automatically reactivate stations when reactivating a group
    // This allows for selective reactivation of stations
    // Stations must be reactivated individually if needed

    return this.stationGroupRepository.save(stationGroup);
  }

  async getStationsInGroup(groupId: string) {
    const stationGroup = await this.stationGroupRepository.findOne({
      where: { id: groupId },
      relations: ['stations', 'stations.contacts'],
    });

    if (!stationGroup) {
      throw new NotFoundException('Station group not found');
    }

    return stationGroup.stations.filter(station => station.isActive);
  }

  async getIndependentStations(): Promise<Station[]> {
    return this.stationRepository.find({
      where: {
        stationGroupId: null, // Explicitly null - independent stations
        isActive: true,
      },
      relations: ['contacts'],
      order: { name: 'ASC' },
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
      this.stationRepository.count({ where: { stationGroupId: null, isActive: true } }),
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
