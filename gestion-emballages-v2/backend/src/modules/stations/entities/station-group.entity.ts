import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { User } from '@modules/users/entities/user.entity';
import { Station } from './station.entity';

@Entity('station_groups')
export class StationGroup extends BaseEntity {
  @Column({ unique: true })
  identifiant: string;

  @Column()
  name: string;

  @Column({ name: 'description', nullable: true })
  description?: string;

  @Column({ name: 'main_contact', type: 'jsonb', default: {} })
  mainContact: {
    name?: string;
    position?: string;
    phone?: string;
    email?: string;
  };

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdById?: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedById?: string;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: User;

  @OneToMany(() => Station, (station) => station.groupe)
  stations: Station[];

  // Virtual properties
  get stationsCount(): number {
    return this.stations?.length || 0;
  }

  get activeStationsCount(): number {
    return this.stations?.filter(station => station.isActive).length || 0;
  }
}