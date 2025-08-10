import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { User } from '@modules/users/entities/user.entity';
import { Station } from './station.entity';

@Entity('station_contacts')
export class StationContact extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  position?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ name: 'is_primary', nullable: true, default: false })
  isPrimary?: boolean;

  @Column({ name: 'station_id' })
  stationId: string;

  // Relations
  @ManyToOne(() => Station, station => station.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'station_id' })
  station: Station;

  // Virtual properties
  get displayName(): string {
    if (this.position) {
      return `${this.name} - ${this.position}`;
    }
    return this.name;
  }

  get hasContactInfo(): boolean {
    return !!(this.phone || this.email);
  }
}
