import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { User } from '@modules/users/entities/user.entity';
import { Commande } from '@modules/commandes/entities/commande.entity';
import { CommandeGlobale } from '@modules/commandes/entities/commande-globale.entity';
import { StockStation } from '@modules/stocks/entities/stock-station.entity';
import { DemandeTransfert } from '@modules/transferts/entities/demande-transfert.entity';
import { Prevision } from '@modules/previsions/entities/prevision.entity';
import { ListeAchat } from '@modules/listes-achat/entities/liste-achat.entity';

@Entity('stations')
export class Station extends BaseEntity {
  @Column()
  nom: string;

  @Column({ name: 'identifiant_interne', nullable: true })
  identifiantInterne?: string;

  @Column({ type: 'jsonb', default: {} })
  adresse: {
    rue?: string;
    codePostal?: string;
    ville?: string;
    pays?: string;
  };

  @Column({ name: 'contact_principal', type: 'jsonb', default: {} })
  contactPrincipal: {
    nom?: string;
    telephone?: string;
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

  // Note: Users are linked via polymorphic relationship (entiteType/entiteId)
  // No direct OneToMany relationship to avoid foreign key conflicts

  @OneToMany(() => Commande, (commande) => commande.station)
  commandes: Commande[];

  @OneToMany(() => CommandeGlobale, (commandeGlobale) => commandeGlobale.station)
  commandesGlobales: CommandeGlobale[];

  @OneToMany(() => StockStation, (stock) => stock.station)
  stocks: StockStation[];

  @OneToMany(() => DemandeTransfert, (demande) => demande.stationDemandeuse)
  demandesTransfertEmises: DemandeTransfert[];

  @OneToMany(() => DemandeTransfert, (demande) => demande.stationSource)
  demandesTransfertRecues: DemandeTransfert[];

  @OneToMany(() => Prevision, (prevision) => prevision.station)
  previsions: Prevision[];

  @OneToMany(() => ListeAchat, (liste) => liste.station)
  listesAchat: ListeAchat[];
}