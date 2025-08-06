import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Fournisseur } from './fournisseur.entity';
import { StockFournisseur } from '@modules/stocks/entities/stock-fournisseur.entity';

@Entity('fournisseur_sites')
export class FournisseurSite extends BaseEntity {
  @Column({ name: 'fournisseur_id' })
  fournisseurId: string;

  @Column()
  nom: string;

  @Column({ type: 'jsonb', default: {} })
  adresse: {
    rue?: string;
    codePostal?: string;
    ville?: string;
    pays?: string;
  };

  @Column({ name: 'is_principal', default: false })
  isPrincipal: boolean;

  // Relations
  @ManyToOne(() => Fournisseur, (fournisseur) => fournisseur.sites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fournisseur_id' })
  fournisseur: Fournisseur;

  @OneToMany(() => StockFournisseur, (stock) => stock.fournisseurSite)
  stocks: StockFournisseur[];
}