import { BeforeInsert, BeforeUpdate, Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { IBusinessContact } from '@common/interfaces/business-contact.interface';
import { User } from '@modules/users/entities/user.entity';
import { Platform } from './platform.entity';

@Entity('platform_contacts')
@Index(['platformId', 'isPrincipal'])
export class PlatformContact extends BaseEntity implements IBusinessContact {
  @Column({ name: 'platform_id' })
  platformId: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ nullable: true })
  position?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ name: 'is_principal', default: false })
  isPrincipal: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdById?: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedById?: string;

  // Relations
  @ManyToOne(() => Platform, platform => platform.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'platform_id' })
  platform: Platform;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: User;

  // Virtual properties
  get displayName(): string {
    if (this.position) {
      return `${this.fullName} - ${this.position}`;
    }
    return this.fullName;
  }

  get hasContactInfo(): boolean {
    return !!(this.phone || this.email);
  }

  get initials(): string {
    return this.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Hooks
  @BeforeInsert()
  @BeforeUpdate()
  async ensureSinglePrincipal() {
    if (this.isPrincipal && this.platformId) {
      // This will be handled in the service layer to avoid circular dependencies
      // Service will ensure only one principal contact per platform
    }
  }

  // Validation
  @BeforeInsert()
  @BeforeUpdate()
  validateContact() {
    if (!this.phone && !this.email) {
      // At least one contact method should be provided
      console.warn(`Contact ${this.fullName} has no contact information`);
    }

    if (this.email && !this.isValidEmail(this.email)) {
      throw new Error('Invalid email format');
    }

    if (this.phone && !this.isValidPhone(this.phone)) {
      console.warn(`Contact ${this.fullName} has potentially invalid phone format`);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // Basic phone validation - can be enhanced based on requirements
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }
}
