import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformContact } from './entities/platform-contact.entity';
import { Platform } from './entities/platform.entity';
import { CreatePlatformContactDto } from './dto/create-platform-contact.dto';
import { UpdatePlatformContactDto } from './dto/update-platform-contact.dto';

@Injectable()
export class PlatformContactsService {
  constructor(
    @InjectRepository(PlatformContact)
    private contactRepository: Repository<PlatformContact>,
    @InjectRepository(Platform)
    private platformRepository: Repository<Platform>
  ) {}

  async create(platformId: string, createDto: CreatePlatformContactDto, userId?: string): Promise<PlatformContact> {
    // Verify platform exists
    const platform = await this.platformRepository.findOne({
      where: { id: platformId, isActive: true },
    });

    if (!platform) {
      throw new NotFoundException(`Platform with id ${platformId} not found`);
    }

    // If this contact should be principal, ensure no other principal exists
    if (createDto.isPrincipal) {
      await this.ensureSinglePrincipal(platformId);
    }

    const contact = this.contactRepository.create({
      ...createDto,
      platformId,
      createdById: userId,
      updatedById: userId,
    });

    return await this.contactRepository.save(contact);
  }

  async findAll(platformId: string): Promise<PlatformContact[]> {
    return await this.contactRepository.find({
      where: { platformId },
      order: { isPrincipal: 'DESC', fullName: 'ASC' },
    });
  }

  async findActive(platformId: string): Promise<PlatformContact[]> {
    return await this.contactRepository.find({
      where: { platformId, isActive: true },
      order: { isPrincipal: 'DESC', fullName: 'ASC' },
    });
  }

  async findOne(platformId: string, contactId: string): Promise<PlatformContact> {
    const contact = await this.contactRepository.findOne({
      where: { id: contactId, platformId },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with id ${contactId} not found`);
    }

    return contact;
  }

  async findPrincipal(platformId: string): Promise<PlatformContact | null> {
    return await this.contactRepository.findOne({
      where: { platformId, isPrincipal: true, isActive: true },
    });
  }

  async update(
    platformId: string,
    contactId: string,
    updateDto: UpdatePlatformContactDto,
    userId?: string
  ): Promise<PlatformContact> {
    const contact = await this.findOne(platformId, contactId);

    // If setting as principal, ensure no other principal exists
    if (updateDto.isPrincipal && !contact.isPrincipal) {
      await this.ensureSinglePrincipal(platformId, contactId);
    }

    Object.assign(contact, {
      ...updateDto,
      updatedById: userId,
    });

    return await this.contactRepository.save(contact);
  }

  async setPrincipal(platformId: string, contactId: string, userId?: string): Promise<PlatformContact> {
    const contact = await this.findOne(platformId, contactId);

    if (!contact.isActive) {
      throw new BadRequestException('Cannot set inactive contact as principal');
    }

    await this.ensureSinglePrincipal(platformId, contactId);

    contact.isPrincipal = true;
    contact.updatedById = userId;

    return await this.contactRepository.save(contact);
  }

  async deactivate(platformId: string, contactId: string, userId?: string): Promise<PlatformContact> {
    const contact = await this.findOne(platformId, contactId);

    if (contact.isPrincipal) {
      throw new BadRequestException(
        'Cannot deactivate principal contact. Please designate another contact as principal first.'
      );
    }

    contact.isActive = false;
    contact.updatedById = userId;

    return await this.contactRepository.save(contact);
  }

  async reactivate(platformId: string, contactId: string, userId?: string): Promise<PlatformContact> {
    const contact = await this.findOne(platformId, contactId);

    contact.isActive = true;
    contact.updatedById = userId;

    return await this.contactRepository.save(contact);
  }

  async remove(platformId: string, contactId: string): Promise<void> {
    const contact = await this.findOne(platformId, contactId);

    if (contact.isPrincipal) {
      throw new BadRequestException(
        'Cannot delete principal contact. Please designate another contact as principal first.'
      );
    }

    await this.contactRepository.remove(contact);
  }

  private async ensureSinglePrincipal(platformId: string, excludeContactId?: string): Promise<void> {
    // Remove principal status from all other contacts
    const query = this.contactRepository
      .createQueryBuilder()
      .update(PlatformContact)
      .set({ isPrincipal: false })
      .where('platformId = :platformId', { platformId })
      .andWhere('isPrincipal = :estPrincipal', { isPrincipal: true });

    if (excludeContactId) {
      query.andWhere('id != :excludeContactId', { excludeContactId });
    }

    await query.execute();
  }

  async migrateFromEmbeddedContacts(): Promise<void> {
    // Migration method to convert embedded contacts from platform sites
    const platforms = await this.platformRepository.find({
      relations: ['sites'],
    });

    for (const platform of platforms) {
      // Check if platform already has contacts
      const existingContacts = await this.findAll(platform.id);
      if (existingContacts.length > 0) {
        continue; // Skip if already has contacts
      }

      // Note: PlatformSite migration code removed as sites are no longer used
      // Contacts are now managed directly through PlatformContact entities

      // If no contacts exist, create a default one
      const existingContactsAfterCheck = await this.findAll(platform.id);
      if (existingContactsAfterCheck.length === 0) {
        await this.create(platform.id, {
          fullName: `Contact ${platform.name}`,
          position: 'Contact Principal',
          isPrincipal: true,
          isActive: true,
        });
      }
    }
  }
}
