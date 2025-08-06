import { Entity, Column, ManyToOne, JoinColumn, Unique, Check } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Station } from '@modules/stations/entities/station.entity';
import { Article } from '@modules/articles/entities/article.entity';
import { Fournisseur } from '@modules/fournisseurs/entities/fournisseur.entity';
import { User } from '@modules/users/entities/user.entity';

@Entity('previsions')
@Unique(['campagne', 'stationId', 'articleId', 'fournisseurId', 'semaine'])
@Check('check_semaine_range', 'semaine BETWEEN 1 AND 52')
export class Prevision extends BaseEntity {
  @Column({ length: 10 })
  campagne: string; // e.g., '25-26'

  @Column({ name: 'station_id' })
  stationId: string;

  @Column({ name: 'article_id' })
  articleId: string;

  @Column({ name: 'fournisseur_id' })
  fournisseurId: string;

  @Column()
  semaine: number; // 1-52

  @Column({ name: 'quantite_prevue' })
  quantitePrevue: number;

  @Column({ name: 'created_by', nullable: true })
  createdById?: string;

  // Relations
  @ManyToOne(() => Station, (station) => station.previsions)
  @JoinColumn({ name: 'station_id' })
  station: Station;

  @ManyToOne(() => Article, (article) => article.previsions)
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @ManyToOne(() => Fournisseur, (fournisseur) => fournisseur.previsions)
  @JoinColumn({ name: 'fournisseur_id' })
  fournisseur: Fournisseur;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;
}