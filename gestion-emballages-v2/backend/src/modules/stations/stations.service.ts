import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Station } from './entities/station.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationService, PaginationOptions } from '@common/services/pagination.service';

@Injectable()
export class StationsService {
  constructor(
    @InjectRepository(Station)
    private stationRepository: Repository<Station>,
    private paginationService: PaginationService,
  ) {}

  async create(createStationDto: CreateStationDto): Promise<Station> {
    const station = this.stationRepository.create(createStationDto);
    return this.stationRepository.save(station);
  }

  async findAll(paginationDto: PaginationDto) {
    const paginationOptions = this.paginationService.validatePaginationOptions({
      page: paginationDto.page || 1,
      limit: paginationDto.limit || 20,
      sortBy: paginationDto.sortBy || 'nom',
      sortOrder: paginationDto.sortOrder || 'ASC'
    });

    const queryBuilder = this.stationRepository.createQueryBuilder('station');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(station.nom ILIKE :search OR station.identifiantInterne ILIKE :search)',
        { search: `%${paginationDto.search}%` }
      );
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
      relations: ['users', 'createdBy', 'updatedBy']
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

  // Utility methods for user selection
  async findActiveStations(): Promise<Station[]> {
    return this.stationRepository.find({
      where: { isActive: true },
      order: { nom: 'ASC' },
      select: ['id', 'nom', 'identifiantInterne']
    });
  }
}