import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Check } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { TransferStatus } from '@common/enums/transfer-status.enum';
import { Station } from '@modules/stations/entities/station.entity';
import { User } from '@modules/users/entities/user.entity';
import { DemandeTransfertArticle } from './demande-transfert-article.entity';

@Entity('demandes_transfert')
@Check('check_different_stations', 'station_demandeuse_id != station_source_id')
export class DemandeTransfert extends BaseEntity {
  @Column({ name: 'numero_demande', unique: true, length: 100 })
  numeroDemande: string;

  @Column({ name: 'station_demandeuse_id' })
  stationDemandeuseId: string;

  @Column({ name: 'station_source_id' })
  stationSourceId: string;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.ENREGISTREE,
  })
  statut: TransferStatus;

  @Column({
    name: 'montant_total',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  montantTotal: number;

  @Column({ name: 'created_by', nullable: true })
  createdById?: string;

  // Relations
  @ManyToOne(() => Station, (station) => station.demandesTransfertEmises)
  @JoinColumn({ name: 'station_demandeuse_id' })
  stationDemandeuse: Station;

  @ManyToOne(() => Station, (station) => station.demandesTransfertRecues)
  @JoinColumn({ name: 'station_source_id' })
  stationSource: Station;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @OneToMany(() => DemandeTransfertArticle, (article) => article.demandeTransfert)
  articles: DemandeTransfertArticle[];
}