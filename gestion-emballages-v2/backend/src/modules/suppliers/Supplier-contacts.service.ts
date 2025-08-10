import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierContact } from './entities/supplier-contact.entity';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierContactDto } from './dto/create-Supplier-contact.dto';
import { UpdateSupplierContactDto } from './dto/update-Supplier-contact.dto';

@Injectable()
export class SupplierContactsService {
  constructor(
    @InjectRepository(SupplierContact)
    private contactRepository: Repository<SupplierContact>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>
  ) {}

  async create(supplierId: string, createDto: CreateSupplierContactDto, userId?: string): Promise<SupplierContact> {
    // Verify Supplier exists
    const supplier = await this.supplierRepository.findOne({
      where: { id: supplierId, isActive: true },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with id ${supplierId} not found`);
    }

    // If this contact should be principal, ensure no other principal exists
    if (createDto.isPrincipal) {
      await this.ensureSinglePrincipal(supplierId);
    }

    const contact = this.contactRepository.create({
      ...createDto,
      supplierId,
      createdById: userId,
      updatedById: userId,
    });

    return await this.contactRepository.save(contact);
  }

  async findAll(supplierId: string): Promise<SupplierContact[]> {
    return await this.contactRepository.find({
      where: { supplierId },
      order: { isPrincipal: 'DESC', fullName: 'ASC' },
    });
  }

  async findActive(supplierId: string): Promise<SupplierContact[]> {
    return await this.contactRepository.find({
      where: { supplierId, isActive: true },
      order: { isPrincipal: 'DESC', fullName: 'ASC' },
    });
  }

  async findOne(supplierId: string, contactId: string): Promise<SupplierContact> {
    const contact = await this.contactRepository.findOne({
      where: { id: contactId, supplierId },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with id ${contactId} not found`);
    }

    return contact;
  }

  async findPrincipal(supplierId: string): Promise<SupplierContact | null> {
    return await this.contactRepository.findOne({
      where: { supplierId, isPrincipal: true, isActive: true },
    });
  }

  async update(
    supplierId: string,
    contactId: string,
    updateDto: UpdateSupplierContactDto,
    userId?: string
  ): Promise<SupplierContact> {
    const contact = await this.findOne(supplierId, contactId);

    // If setting as principal, ensure no other principal exists
    if (updateDto.isPrincipal && !contact.isPrincipal) {
      await this.ensureSinglePrincipal(supplierId, contactId);
    }

    Object.assign(contact, {
      ...updateDto,
      updatedById: userId,
    });

    return await this.contactRepository.save(contact);
  }

  async setPrincipal(supplierId: string, contactId: string, userId?: string): Promise<SupplierContact> {
    const contact = await this.findOne(supplierId, contactId);

    if (!contact.isActive) {
      throw new BadRequestException('Cannot set inactive contact as principal');
    }

    await this.ensureSinglePrincipal(supplierId, contactId);

    contact.isPrincipal = true;
    contact.updatedById = userId;

    return await this.contactRepository.save(contact);
  }

  async deactivate(supplierId: string, contactId: string, userId?: string): Promise<SupplierContact> {
    const contact = await this.findOne(supplierId, contactId);

    if (contact.isPrincipal) {
      throw new BadRequestException(
        'Cannot deactivate principal contact. Please designate another contact as principal first.'
      );
    }

    contact.isActive = false;
    contact.updatedById = userId;

    return await this.contactRepository.save(contact);
  }

  async reactivate(supplierId: string, contactId: string, userId?: string): Promise<SupplierContact> {
    const contact = await this.findOne(supplierId, contactId);

    contact.isActive = true;
    contact.updatedById = userId;

    return await this.contactRepository.save(contact);
  }

  async remove(supplierId: string, contactId: string): Promise<void> {
    const contact = await this.findOne(supplierId, contactId);

    if (contact.isPrincipal) {
      throw new BadRequestException(
        'Cannot delete principal contact. Please designate another contact as principal first.'
      );
    }

    await this.contactRepository.remove(contact);
  }

  private async ensureSinglePrincipal(supplierId: string, excludeContactId?: string): Promise<void> {
    // Remove principal status from all other contacts
    const query = this.contactRepository
      .createQueryBuilder()
      .update(SupplierContact)
      .set({ isPrincipal: false })
      .where('supplierId = :supplierId', { supplierId })
      .andWhere('isPrincipal = :isPrincipal', { isPrincipal: true });

    if (excludeContactId) {
      query.andWhere('id != :excludeContactId', { excludeContactId });
    }

    await query.execute();
  }

  async migrateFromEmbeddedContacts(): Promise<void> {
    // Migration method to convert embedded contacts from platform sites
    // This would be called during the migration phase
    const suppliers = await this.supplierRepository.find({
      relations: ['sites'],
    });

    for (const supplier of suppliers) {
      // Check if Supplier already has contacts
      const existingContacts = await this.findAll(supplier.id);
      if (existingContacts.length > 0) {
        continue; // Skip if already has contacts
      }

      // Create default contact if needed
      // This is a placeholder - actual migration logic would depend on data structure
      if (supplier.sites && supplier.sites.length > 0) {
        // Create a default contact based on available data
        await this.create(supplier.id, {
          fullName: `Contact ${supplier.name}`,
          position: 'Contact Principal',
          isPrincipal: true,
          isActive: true,
        });
      }
    }
  }
}
