import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { OrderStatus } from '@common/enums/order-status.enum';
import { Station } from '@modules/stations/entities/station.entity';
import { Fournisseur } from '@modules/fournisseurs/entities/fournisseur.entity';
import { User } from '@modules/users/entities/user.entity';
import { CommandeGlobale } from './commande-globale.entity';
import { CommandeArticle } from './commande-article.entity';

@Entity('commandes')
export class Commande extends BaseEntity {
  @Column({ name: 'numero_commande', unique: true, length: 100 })
  numeroCommande: string;

  @Column({ name: 'commande_globale_id', nullable: true })
  commandeGlobaleId?: string;

  @Column({ name: 'station_id' })
  stationId: string;

  @Column({ name: 'fournisseur_id' })
  fournisseurId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.ENREGISTREE,
  })
  statut: OrderStatus;

  @Column({
    name: 'montant_total_ht',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  montantTotalHt: number;

  @Column({ name: 'date_livraison_prevue', type: 'date', nullable: true })
  dateLivraisonPrevue?: Date;

  @Column({ name: 'date_livraison_reelle', type: 'date', nullable: true })
  dateLivraisonReelle?: Date;

  @Column({ name: 'created_by', nullable: true })
  createdById?: string;

  // Relations
  @ManyToOne(() => CommandeGlobale, (commandeGlobale) => commandeGlobale.commandes, {
    nullable: true,
  })
  @JoinColumn({ name: 'commande_globale_id' })
  commandeGlobale?: CommandeGlobale;

  @ManyToOne(() => Station, (station) => station.commandes)
  @JoinColumn({ name: 'station_id' })
  station: Station;

  @ManyToOne(() => Fournisseur, (fournisseur) => fournisseur.commandes)
  @JoinColumn({ name: 'fournisseur_id' })
  fournisseur: Fournisseur;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @OneToMany(() => CommandeArticle, (commandeArticle) => commandeArticle.commande)
  commandeArticles: CommandeArticle[];
}