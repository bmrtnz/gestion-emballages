import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Station } from '@modules/stations/entities/station.entity';
import { User } from '@modules/users/entities/user.entity';
import { ListeAchatItem } from './liste-achat-item.entity';

@Entity('liste_achats')
export class ListeAchat extends BaseEntity {
  @Column({ name: 'station_id' })
  stationId: string;

  @Column({ length: 50, default: 'active' })
  statut: string;

  @Column({ name: 'created_by', nullable: true })
  createdById?: string;

  // Relations
  @ManyToOne(() => Station, (station) => station.listesAchat)
  @JoinColumn({ name: 'station_id' })
  station: Station;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @OneToMany(() => ListeAchatItem, (item) => item.listeAchat)
  items: ListeAchatItem[];
}