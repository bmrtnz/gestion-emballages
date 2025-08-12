import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { User } from '@modules/users/entities/user.entity';
import { Station } from './station.entity';

@Entity('station_contacts')
@Index('idx_station_primary_contact', ['stationId', 'isPrimary'], { 
  unique: true, 
  where: 'is_primary = true' 
})
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

  // Audit fields
  @Column({ name: 'created_by' })
  createdById: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedById?: string;

  // Relations
  @ManyToOne(() => Station, station => station.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'station_id' })
  station: Station;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: User;

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
