import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { User } from '@modules/users/entities/user.entity';
import { FournisseurSite } from './fournisseur-site.entity';
import { ArticleFournisseur } from '@modules/articles/entities/article-fournisseur.entity';
import { Commande } from '@modules/commandes/entities/commande.entity';
import { Prevision } from '@modules/previsions/entities/prevision.entity';

@Entity('fournisseurs')
export class Fournisseur extends BaseEntity {
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

  // Note: Users are linked via polymorphic relationship (entiteType/entiteId)
  // No direct OneToMany relationship to avoid foreign key conflicts

  @OneToMany(() => FournisseurSite, (site) => site.fournisseur)
  sites: FournisseurSite[];

  @OneToMany(() => ArticleFournisseur, (articleFournisseur) => articleFournisseur.fournisseur)
  articleFournisseurs: ArticleFournisseur[];

  @OneToMany(() => Commande, (commande) => commande.fournisseur)
  commandes: Commande[];

  @OneToMany(() => Prevision, (prevision) => prevision.fournisseur)
  previsions: Prevision[];
}