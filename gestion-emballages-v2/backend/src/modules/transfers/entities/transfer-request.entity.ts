import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { TransferStatus } from '@common/enums/transfer-status.enum';
import { Station } from '@modules/stations/entities/station.entity';
import { User } from '@modules/users/entities/user.entity';
import { TransferRequestProduct } from './transfer-request-product.entity';

@Entity('transfer_requests')
@Check('check_different_stations', 'requesting_station_id != source_station_id')
export class TransferRequest extends BaseEntity {
  @Column({ name: 'numero_demande', unique: true, length: 100 })
  numeroDemande: string;

  @Column({ name: 'requesting_station_id' })
  requestingStationId: string;

  @Column({ name: 'source_station_id' })
  sourceStationId: string;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.ENREGISTREE,
  })
  status: TransferStatus;

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
  @ManyToOne(() => Station, station => station.outgoingTransferRequests)
  @JoinColumn({ name: 'requesting_station_id' })
  requestingStation: Station;

  @ManyToOne(() => Station, station => station.incomingTransferRequests)
  @JoinColumn({ name: 'source_station_id' })
  sourceStation: Station;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @OneToMany(() => TransferRequestProduct, product => product.transferRequest)
  products: TransferRequestProduct[];
}
