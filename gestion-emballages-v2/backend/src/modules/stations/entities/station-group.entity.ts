import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { SoftDeletableEntity } from '@common/entities/base.entity';
import { User } from '@modules/users/entities/user.entity';
import { Station } from './station.entity';

@Entity('station_groups')
export class StationGroup extends SoftDeletableEntity {
  @Column()
  name: string;

  @Column({ name: 'description', nullable: true })
  description?: string;

  // Relations

  @OneToMany(() => Station, station => station.stationGroup)
  stations: Station[];

  // Virtual properties
  get stationsCount(): number {
    return this.stations?.length || 0;
  }

  get activeStationsCount(): number {
    return this.stations?.filter(station => station.isActive).length || 0;
  }
}
