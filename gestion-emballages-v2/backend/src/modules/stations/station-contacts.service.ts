import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StationContact } from './entities/station-contact.entity';
import { Station } from './entities/station.entity';
import { CreateStationContactDto } from './dto/create-station-contact.dto';
import { UpdateStationContactDto } from './dto/update-station-contact.dto';

@Injectable()
export class StationContactsService {
  constructor(
    @InjectRepository(StationContact)
    private stationContactRepository: Repository<StationContact>,
    @InjectRepository(Station)
    private stationRepository: Repository<Station>
  ) {}

  async create(createDto: CreateStationContactDto): Promise<StationContact> {
    // Verify station exists
    const station = await this.stationRepository.findOne({
      where: { id: createDto.stationId },
    });

    if (!station) {
      throw new NotFoundException('Station not found');
    }

    // If this is to be the primary contact, ensure no other primary contact exists
    if (createDto.isPrimary) {
      await this.ensurePrimaryContact(createDto.stationId);
    }

    const contact = this.stationContactRepository.create(createDto);
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

  async update(id: string, updateDto: UpdateStationContactDto): Promise<StationContact> {
    const contact = await this.findOne(id);

    // If setting as primary contact, ensure no other primary contact exists
    if (updateDto.isPrimary && !contact.isPrimary) {
      await this.ensurePrimaryContact(contact.stationId, id);
    }

    Object.assign(contact, updateDto);
    return this.stationContactRepository.save(contact);
  }

  async remove(id: string): Promise<void> {
    await this.stationContactRepository.delete(id);
  }

  async setPrincipal(id: string): Promise<StationContact> {
    const contact = await this.findOne(id);

    // Remove primary status from other contacts in the same station
    await this.stationContactRepository.update({ stationId: contact.stationId, isPrimary: true }, { isPrimary: false });

    // Set this contact as primary
    contact.isPrimary = true;
    return this.stationContactRepository.save(contact);
  }

  async getPrimaryContact(stationId: string): Promise<StationContact | null> {
    return this.stationContactRepository.findOne({
      where: { stationId, isPrimary: true },
    });
  }

  private async ensurePrimaryContact(stationId: string, excludeId?: string): Promise<void> {
    const queryBuilder = this.stationContactRepository
      .createQueryBuilder('contact')
      .where('contact.stationId = :stationId', { stationId })
      .andWhere('contact.isPrimary = :isPrimary', { isPrimary: true });

    if (excludeId) {
      queryBuilder.andWhere('contact.id != :excludeId', { excludeId });
    }

    const existingPrimary = await queryBuilder.getOne();

    if (existingPrimary) {
      throw new BadRequestException(
        'This station already has a primary contact. Please remove the primary status from the other contact first.'
      );
    }
  }
}
