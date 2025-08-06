import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Station } from '@modules/stations/entities/station.entity';
import { Article } from '@modules/articles/entities/article.entity';
import { User } from '@modules/users/entities/user.entity';

@Entity('stock_stations')
@Unique(['stationId', 'articleId'])
export class StockStation extends BaseEntity {
  @Column({ name: 'station_id' })
  stationId: string;

  @Column({ name: 'article_id' })
  articleId: string;

  @Column({ name: 'quantite_actuelle', default: 0 })
  quantiteActuelle: number;

  @Column({ name: 'seuil_alerte', nullable: true })
  seuilAlerte?: number;

  @Column({ name: 'seuil_critique', nullable: true })
  seuilCritique?: number;

  @Column({ name: 'derniere_mise_a_jour', default: () => 'CURRENT_TIMESTAMP' })
  derniereMiseAJour: Date;

  @Column({ name: 'updated_by', nullable: true })
  updatedById?: string;

  // Relations
  @ManyToOne(() => Station, (station) => station.stocks)
  @JoinColumn({ name: 'station_id' })
  station: Station;

  @ManyToOne(() => Article, (article) => article.stocksStation)
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: User;
}