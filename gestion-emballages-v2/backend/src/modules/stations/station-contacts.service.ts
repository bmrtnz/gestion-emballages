import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StationContact } from './entities/station-contact.entity';
import { Station } from './entities/station.entity';

export interface CreateStationContactDto {
  fullName: string;
  position?: string;
  phone?: string;
  email?: string;
  isPrincipal?: boolean;
  stationId: string;
}

export interface UpdateStationContactDto {
  fullName?: string;
  position?: string;
  phone?: string;
  email?: string;
  isPrincipal?: boolean;
}

@Injectable()
export class StationContactsService {
  constructor(
    @InjectRepository(StationContact)
    private stationContactRepository: Repository<StationContact>,
    @InjectRepository(Station)
    private stationRepository: Repository<Station>,
  ) {}

  async create(createDto: CreateStationContactDto): Promise<StationContact> {
    // Verify station exists
    const station = await this.stationRepository.findOne({
      where: { id: createDto.stationId },
    });

    if (!station) {
      throw new NotFoundException('Station non trouvée');
    }

    // If this is to be the principal contact, ensure no other principal contact exists
    if (createDto.isPrincipal) {
      await this.ensureNoPrincipalContact(createDto.stationId);
    }

    const contact = this.stationContactRepository.create(createDto);
    return this.stationContactRepository.save(contact);
  }

  async findByStation(stationId: string): Promise<StationContact[]> {
    return this.stationContactRepository.find({
      where: { stationId, isActive: true },
      order: { isPrincipal: 'DESC', fullName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<StationContact> {
    const contact = await this.stationContactRepository.findOne({
      where: { id },
      relations: ['station'],
    });

    if (!contact) {
      throw new NotFoundException('Contact non trouvé');
    }

    return contact;
  }

  async update(id: string, updateDto: UpdateStationContactDto): Promise<StationContact> {
    const contact = await this.findOne(id);

    // If setting as principal contact, ensure no other principal contact exists
    if (updateDto.isPrincipal && !contact.isPrincipal) {
      await this.ensureNoPrincipalContact(contact.stationId, id);
    }

    Object.assign(contact, updateDto);
    return this.stationContactRepository.save(contact);
  }

  async remove(id: string): Promise<void> {
    const contact = await this.findOne(id);
    contact.isActive = false;
    await this.stationContactRepository.save(contact);
  }

  async reactivate(id: string): Promise<StationContact> {
    const contact = await this.findOne(id);
    contact.isActive = true;
    return this.stationContactRepository.save(contact);
  }

  async setPrincipal(id: string): Promise<StationContact> {
    const contact = await this.findOne(id);

    // Remove principal status from other contacts in the same station
    await this.stationContactRepository.update(
      { stationId: contact.stationId, isPrincipal: true },
      { isPrincipal: false },
    );

    // Set this contact as principal
    contact.isPrincipal = true;
    return this.stationContactRepository.save(contact);
  }

  async getPrincipalContact(stationId: string): Promise<StationContact | null> {
    return this.stationContactRepository.findOne({
      where: { stationId, isPrincipal: true, isActive: true },
    });
  }

  private async ensureNoPrincipalContact(stationId: string, excludeId?: string): Promise<void> {
    const queryBuilder = this.stationContactRepository
      .createQueryBuilder('contact')
      .where('contact.stationId = :stationId', { stationId })
      .andWhere('contact.isPrincipal = :estPrincipal', { isPrincipal: true })
      .andWhere('contact.isActive = :isActive', { isActive: true });

    if (excludeId) {
      queryBuilder.andWhere('contact.id != :excludeId', { excludeId });
    }

    const existingPrincipal = await queryBuilder.getOne();

    if (existingPrincipal) {
      throw new BadRequestException(
        'Cette station a déjà un contact principal. Veuillez d\'abord retirer le statut principal de l\'autre contact.',
      );
    }
  }
}