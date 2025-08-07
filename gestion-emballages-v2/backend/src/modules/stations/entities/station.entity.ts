import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { User } from '@modules/users/entities/user.entity';
import { Commande } from '@modules/commandes/entities/commande.entity';
import { CommandeGlobale } from '@modules/commandes/entities/commande-globale.entity';
import { StockStation } from '@modules/stocks/entities/stock-station.entity';
import { DemandeTransfert } from '@modules/transferts/entities/demande-transfert.entity';
import { Prevision } from '@modules/previsions/entities/prevision.entity';
import { ListeAchat } from '@modules/listes-achat/entities/liste-achat.entity';
import { StationGroup } from './station-group.entity';
import { StationContact } from './station-contact.entity';

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

  @Column({ name: 'groupe_id', nullable: true })
  groupeId?: string; // NULL for independent stations that don't belong to any group

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
  @ManyToOne(() => StationGroup, (groupe) => groupe.stations, { nullable: true })
  @JoinColumn({ name: 'groupe_id' })
  groupe?: StationGroup;

  @OneToMany(() => StationContact, (contact) => contact.station, { cascade: true })
  contacts: StationContact[];

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

  // Virtual properties
  get contactPrincipalFromContacts(): StationContact | undefined {
    return this.contacts?.find(contact => contact.estPrincipal && contact.isActive);
  }

  get contactsActifs(): StationContact[] {
    return this.contacts?.filter(contact => contact.isActive) || [];
  }

  get hasGroupe(): boolean {
    return !!this.groupeId && !!this.groupe;
  }

  get isIndependent(): boolean {
    return !this.groupeId;
  }

  get nomCompletAvecGroupe(): string {
    if (this.hasGroupe && this.groupe) {
      return `${this.nom} (${this.groupe.nom})`;
    }
    return this.nom;
  }

  get typeStation(): 'grouped' | 'independent' {
    return this.hasGroupe ? 'grouped' : 'independent';
  }
}