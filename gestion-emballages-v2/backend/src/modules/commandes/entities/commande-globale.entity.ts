import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { OrderStatus } from '@common/enums/order-status.enum';
import { Station } from '@modules/stations/entities/station.entity';
import { User } from '@modules/users/entities/user.entity';
import { Commande } from './commande.entity';

@Entity('commandes_globales')
export class CommandeGlobale extends BaseEntity {
  @Column({ name: 'reference_globale', unique: true, length: 100 })
  referenceGlobale: string;

  @Column({ name: 'station_id' })
  stationId: string;

  @Column({
    name: 'statut_general',
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.ENREGISTREE,
  })
  statutGeneral: OrderStatus;

  @Column({
    name: 'montant_total_ht',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  montantTotalHt: number;

  @Column({ name: 'created_by', nullable: true })
  createdById?: string;

  // Relations
  @ManyToOne(() => Station, (station) => station.commandesGlobales)
  @JoinColumn({ name: 'station_id' })
  station: Station;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @OneToMany(() => Commande, (commande) => commande.commandeGlobale)
  commandes: Commande[];
}