import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { User } from '@modules/users/entities/user.entity';
import { PlatformSite } from './platform-site.entity';
import { Commande } from '@modules/commandes/entities/commande.entity';
import { StockPlatform } from '@modules/stocks/entities/stock-platform.entity';

@Entity('platforms')
export class Platform extends BaseEntity {
  @Column()
  nom: string;

  @Column({ length: 14, nullable: true })
  siret?: string;

  @Column({ length: 50, nullable: true })
  type?: string;

  @Column({ type: 'text', array: true, default: [] })
  specialites: string[];

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

  @OneToMany(() => PlatformSite, (site) => site.platform)
  sites: PlatformSite[];

  @OneToMany(() => Commande, (commande) => commande.platform)
  commandesPlatform: Commande[];

  @OneToMany(() => StockPlatform, (stock) => stock.platform)
  stocks: StockPlatform[];
}