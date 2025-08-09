import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { User } from '@modules/users/entities/user.entity';
import { Station } from './station.entity';

@Entity('station_contacts')
export class StationContact extends BaseEntity {
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

  @Column({ name: 'station_id' })
  stationId: string;

  @Column({ name: 'created_by', nullable: true })
  createdById?: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedById?: string;

  // Relations
  @ManyToOne(() => Station, (station) => station.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'station_id' })
  station: Station;

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
}