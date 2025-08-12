import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StationContact } from './entities/station-contact.entity';
import { Station } from './entities/station.entity';
import { CreateStationContactDto } from './dto/create-station-contact.dto';
import { UpdateStationContactDto } from './dto/update-station-contact.dto';
import { UserRole } from '@common/enums/user-role.enum';

@Injectable()
export class StationContactsService {
  constructor(
    @InjectRepository(StationContact)
    private stationContactRepository: Repository<StationContact>,
    @InjectRepository(Station)
    private stationRepository: Repository<Station>
  ) {}

  async create(createDto: CreateStationContactDto, user: any): Promise<StationContact> {
    // Check permissions: STATION users can only create contacts for their own station
    if (user.role === UserRole.STATION) {
      if (user.entityType !== 'Station' || user.entityId !== createDto.stationId) {
        throw new ForbiddenException('You can only create contacts for your own station');
      }
    }

    // Verify station exists
    const station = await this.stationRepository.findOne({
      where: { id: createDto.stationId },
    });

    if (!station) {
      throw new NotFoundException('Station not found');
    }

    // If this is to be the primary contact, remove primary status from all other contacts in the same station
    if (createDto.isPrimary === true) {
      await this.stationContactRepository.update(
        { stationId: createDto.stationId, isPrimary: true }, 
        { isPrimary: false }
      );
    }

    const contact = this.stationContactRepository.create({
      ...createDto,
      createdById: user.id,
    });
    return this.stationContactRepository.save(contact);
  }

  async findByStation(stationId: string): Promise<StationContact[]> {
    return this.stationContactRepository.find({
      where: { stationId },
      order: { isPrimary: 'DESC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<StationContact> {
    const contact = await this.stationContactRepository.findOne({
      where: { id },
      relations: ['station'],
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return contact;
  }

  async update(id: string, updateDto: UpdateStationContactDto, user: any): Promise<StationContact> {
    const contact = await this.findOne(id);

    // Check permissions: STATION users can only edit contacts from their own station
    if (user.role === UserRole.STATION) {
      if (user.entityType !== 'Station' || user.entityId !== contact.stationId) {
        throw new ForbiddenException('You can only edit contacts from your own station');
      }
    }

    // If setting as primary contact, remove primary status from all other contacts in the same station
    if (updateDto.isPrimary === true && !contact.isPrimary) {
      await this.stationContactRepository.update(
        { stationId: contact.stationId, isPrimary: true }, 
        { isPrimary: false }
      );
    }

    Object.assign(contact, {
      ...updateDto,
      updatedById: user.id,
    });
    return this.stationContactRepository.save(contact);
  }

  async remove(id: string): Promise<void> {
    await this.stationContactRepository.delete(id);
  }

  async setPrincipal(id: string, user: any): Promise<StationContact> {
    const contact = await this.findOne(id);

    // Check permissions: STATION users can only set primary contacts from their own station
    if (user.role === UserRole.STATION) {
      if (user.entityType !== 'Station' || user.entityId !== contact.stationId) {
        throw new ForbiddenException('You can only set primary contacts from your own station');
      }
    }

    // Remove primary status from other contacts in the same station
    await this.stationContactRepository.update({ stationId: contact.stationId, isPrimary: true }, { isPrimary: false });

    // Set this contact as primary
    contact.isPrimary = true;
    contact.updatedById = user.id;
    return this.stationContactRepository.save(contact);
  }

  async getPrimaryContact(stationId: string): Promise<StationContact | null> {
    return this.stationContactRepository.findOne({
      where: { stationId, isPrimary: true },
    });
  }

}
