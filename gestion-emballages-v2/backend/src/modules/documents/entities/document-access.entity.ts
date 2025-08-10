import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Document } from './document.entity';
import { User } from '@modules/users/entities/user.entity';

export enum AccessType {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  ADMIN = 'ADMIN',
}

export enum AccessEntityType {
  USER = 'USER',
  STATION = 'STATION',
  SUPPLIER = 'SUPPLIER',
  PLATFORM = 'PLATFORM',
  ROLE = 'ROLE', // For role-based access
}

@Entity('document_access')
@Unique(['documentId', 'entityType', 'entityId', 'accessType'])
export class DocumentAccess extends BaseEntity {
  @Column({ name: 'document_id' })
  documentId: string;

  @Column({
    type: 'enum',
    enum: AccessType,
  })
  accessType: AccessType;

  // Who has access (polymorphic relationship)
  @Column({
    type: 'enum',
    enum: AccessEntityType,
  })
  entityType: AccessEntityType;

  @Column({ name: 'entity_id' })
  entityId: string;

  // Access constraints
  @Column({ name: 'granted_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  grantedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'granted_by' })
  grantedById: string;

  @Column({ default: true })
  isActive: boolean;

  // Additional constraints
  @Column({ type: 'jsonb', default: {} })
  constraints: {
    // IP restrictions
    allowedIPs?: string[];

    // Time restrictions
    accessHoursStart?: string; // "09:00"
    accessHoursEnd?: string; // "18:00"

    // Download limits
    maxDownloads?: number;
    currentDownloads?: number;

    // Custom constraints
    customRules?: Record<string, unknown>;
  };

  // Relations
  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'granted_by' })
  grantedBy: User;

  // Virtual properties
  get isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  get isTimeRestricted(): boolean {
    return !!(this.constraints.accessHoursStart && this.constraints.accessHoursEnd);
  }

  get canAccessNow(): boolean {
    if (!this.isActive || this.isExpired) return false;

    if (this.isTimeRestricted) {
      const now = new Date();
      const currentTime =
        now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

      return currentTime >= this.constraints.accessHoursStart! && currentTime <= this.constraints.accessHoursEnd!;
    }

    return true;
  }

  get hasDownloadQuota(): boolean {
    if (!this.constraints.maxDownloads) return true;

    const current = this.constraints.currentDownloads || 0;
    return current < this.constraints.maxDownloads;
  }
}
