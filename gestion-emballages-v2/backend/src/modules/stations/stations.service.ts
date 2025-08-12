import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Station } from './entities/station.entity';
import { StationGroup } from './entities/station-group.entity';
import { StationContact } from './entities/station-contact.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { StationFilterDto } from './dto/station-filter.dto';
import { PaginationService } from '@common/services/pagination.service';

@Injectable()
export class StationsService {
  constructor(
    @InjectRepository(Station)
    private stationRepository: Repository<Station>,
    @InjectRepository(StationGroup)
    private stationGroupRepository: Repository<StationGroup>,
    @InjectRepository(StationContact)
    private stationContactRepository: Repository<StationContact>,
    private paginationService: PaginationService
  ) {}

  async create(createStationDto: CreateStationDto, userId: string): Promise<Station> {
    // Transform the create DTO to handle address object properly
    const transformedDto: any = { ...createStationDto };
    
    // If address is sent as an object from frontend, extract the individual fields
    if (transformedDto.address && typeof transformedDto.address === 'object') {
      const addressObj = transformedDto.address as any;
      transformedDto.address = addressObj.street || addressObj.address || null;
      transformedDto.city = addressObj.city || transformedDto.city;
      transformedDto.postalCode = addressObj.postalCode || transformedDto.postalCode;
      transformedDto.country = addressObj.country || transformedDto.country;
    }

    // Ensure address is always a string or null for the entity
    if (typeof transformedDto.address === 'object') {
      transformedDto.address = null;
    }

    const station = this.stationRepository.create({
      name: transformedDto.name,
      code: transformedDto.code,
      address: transformedDto.address,
      city: transformedDto.city,
      postalCode: transformedDto.postalCode,
      country: transformedDto.country,
      coordinates: transformedDto.coordinates,
      stationGroupId: transformedDto.stationGroupId,
      createdById: userId,
    });
    
    const saved = await this.stationRepository.save(station);
    return this.transformStationResponse(saved);
  }

  async findAll(stationFilterDto: StationFilterDto) {
    const paginationOptions = this.paginationService.validatePaginationOptions({
      page: stationFilterDto.page || 1,
      limit: stationFilterDto.limit || 10,
      sortBy: stationFilterDto.sortBy || 'name',
      sortOrder: stationFilterDto.sortOrder || 'ASC',
    });

    const queryBuilder = this.stationRepository
      .createQueryBuilder('station')
      .leftJoinAndSelect('station.stationGroup', 'stationGroup')
      .leftJoinAndSelect('station.contacts', 'contacts');

    // Add search functionality
    if (stationFilterDto.search) {
      queryBuilder.where(
        '(station.name ILIKE :search OR station.code ILIKE :search OR stationGroup.name ILIKE :search)',
        { search: `%${stationFilterDto.search}%` }
      );
    }

    // Add station group filter
    if (stationFilterDto.stationGroupId) {
      if (stationFilterDto.stationGroupId === 'independent') {
        queryBuilder.andWhere('station.stationGroupId IS NULL');
      } else {
        queryBuilder.andWhere('station.stationGroupId = :stationGroupId', {
          stationGroupId: stationFilterDto.stationGroupId,
        });
      }
    }

    // Add status filter
    if (stationFilterDto.status === 'active') {
      queryBuilder.andWhere('station.isActive = :isActive', { isActive: true });
    } else if (stationFilterDto.status === 'inactive') {
      queryBuilder.andWhere('station.isActive = :isActive', { isActive: false });
    }

    // Add city filter
    if (stationFilterDto.city) {
      queryBuilder.andWhere('station.city ILIKE :city', { city: `%${stationFilterDto.city}%` });
    }

    // Add sorting and pagination
    queryBuilder
      .orderBy(`station.${paginationOptions.sortBy}`, paginationOptions.sortOrder)
      .skip(this.paginationService.getSkip(paginationOptions.page, paginationOptions.limit))
      .take(paginationOptions.limit);

    const [rawData, total] = await queryBuilder.getManyAndCount();

    // Transform data to match frontend expectations
    const data = rawData.map(station => this.transformStationResponse(station));

    return this.paginationService.createPaginatedResponse(data, total, paginationOptions);
  }

  private transformStationResponse(station: Station): any {
    return {
      id: station.id,
      name: station.name,
      code: station.code,
      address: {
        street: station.address,
        city: station.city,
        postalCode: station.postalCode,
        country: station.country,
      },
      coordinates: station.coordinates,
      stationGroupId: station.stationGroupId,
      stationGroup: station.stationGroup,
      contacts: (station.contacts || []).map(contact => ({
        id: contact.id,
        name: contact.name,
        position: contact.position,
        phone: contact.phone,
        email: contact.email,
        isPrimary: contact.isPrimary,
        stationId: contact.stationId,
      })),
      isActive: station.isActive,
      createdAt: station.createdAt,
      updatedAt: station.updatedAt,
      // Virtual properties
      principalContactFromContacts: station.principalContactFromContacts,
      activeContacts: station.activeContacts,
      hasGroup: station.hasGroup,
      isIndependent: station.isIndependent,
      fullNameWithGroup: station.fullNameWithGroup,
      stationType: station.stationType,
    };
  }

  async findOne(id: string): Promise<any> {
    const station = await this.stationRepository.findOne({
      where: { id },
      relations: ['stationGroup', 'contacts'],
    });

    if (!station) {
      throw new NotFoundException('Station not found');
    }

    return this.transformStationResponse(station);
  }

  async update(id: string, updateStationDto: UpdateStationDto, userId: string): Promise<Station> {
    const station = await this.stationRepository.findOne({
      where: { id },
      relations: ['stationGroup', 'contacts'],
    });

    if (!station) {
      throw new NotFoundException('Station not found');
    }

    // Transform the update DTO to handle address object properly
    const transformedDto: any = { ...updateStationDto };
    
    // If address is sent as an object from frontend, extract the individual fields
    if (transformedDto.address && typeof transformedDto.address === 'object') {
      const addressObj = transformedDto.address as any;
      transformedDto.address = addressObj.street || addressObj.address || null;
      if (addressObj.city !== undefined) transformedDto.city = addressObj.city;
      if (addressObj.postalCode !== undefined) transformedDto.postalCode = addressObj.postalCode;
      if (addressObj.country !== undefined) transformedDto.country = addressObj.country;
    }

    // Ensure address is always a string or null for the entity
    if (typeof transformedDto.address === 'object') {
      transformedDto.address = null;
    }

    // Update only the fields that are defined in the DTO
    const updateData: Partial<Station> = {
      updatedById: userId,
    };

    if (transformedDto.name !== undefined) updateData.name = transformedDto.name;
    if (transformedDto.code !== undefined) updateData.code = transformedDto.code;
    if (transformedDto.address !== undefined) updateData.address = transformedDto.address;
    if (transformedDto.city !== undefined) updateData.city = transformedDto.city;
    if (transformedDto.postalCode !== undefined) updateData.postalCode = transformedDto.postalCode;
    if (transformedDto.country !== undefined) updateData.country = transformedDto.country;
    if (transformedDto.coordinates !== undefined) updateData.coordinates = transformedDto.coordinates;
    if (transformedDto.stationGroupId !== undefined) updateData.stationGroupId = transformedDto.stationGroupId;

    Object.assign(station, updateData);
    const updated = await this.stationRepository.save(station);
    return this.transformStationResponse(updated);
  }

  async remove(id: string, userId: string): Promise<void> {
    const station = await this.stationRepository.findOne({
      where: { id },
      relations: ['stationGroup', 'contacts'],
    });

    if (!station) {
      throw new NotFoundException('Station not found');
    }

    station.isActive = false;
    station.updatedById = userId;
    await this.stationRepository.save(station);
  }

  async reactivate(id: string, userId: string): Promise<Station> {
    const station = await this.stationRepository.findOne({
      where: { id },
      relations: ['stationGroup', 'contacts'],
    });

    if (!station) {
      throw new NotFoundException('Station not found');
    }

    station.isActive = true;
    station.updatedById = userId;
    const updated = await this.stationRepository.save(station);
    return this.transformStationResponse(updated);
  }

  // Station Group methods
  async assignToGroup(stationId: string, groupId: string | null, userId: string): Promise<Station> {
    const station = await this.stationRepository.findOne({
      where: { id: stationId },
      relations: ['stationGroup', 'contacts'],
    });

    if (!station) {
      throw new NotFoundException('Station not found');
    }

    if (groupId) {
      const stationGroup = await this.stationGroupRepository.findOne({
        where: { id: groupId, isActive: true },
      });

      if (!stationGroup) {
        throw new NotFoundException('Station group not found');
      }
    }

    station.stationGroupId = groupId;
    station.updatedById = userId;
    const updated = await this.stationRepository.save(station);
    return this.transformStationResponse(updated);
  }

  async getStationsByGroup(): Promise<{ groupe: StationGroup | null; stations: Station[] }[]> {
    const stations = await this.stationRepository.find({
      where: { isActive: true },
      relations: ['stationGroup'],
      order: { name: 'ASC' },
    });

    // Group stations by their station group
    const grouped = new Map();

    for (const station of stations) {
      const groupKey = station.stationGroup?.id || 'ungrouped';
      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, {
          groupe: station.stationGroup || null,
          stations: [],
        });
      }
      grouped.get(groupKey).stations.push(station);
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
      relations: ['stationGroup'],
      order: { name: 'ASC' },
      select: ['id', 'name', 'code', 'stationGroupId'],
    });
  }

  async findStationsInGroup(groupId: string): Promise<Station[]> {
    return this.stationRepository.find({
      where: { stationGroupId: groupId, isActive: true },
      relations: ['contacts'],
      order: { name: 'ASC' },
    });
  }
}
