import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { FournisseurSite } from '@modules/fournisseurs/entities/fournisseur-site.entity';
import { Article } from '@modules/articles/entities/article.entity';

@Entity('stock_fournisseurs')
@Unique(['fournisseurSiteId', 'articleId'])
export class StockFournisseur extends BaseEntity {
  @Column({ name: 'fournisseur_site_id' })
  fournisseurSiteId: string;

  @Column({ name: 'article_id' })
  articleId: string;

  @Column({ name: 'quantite_disponible', default: 0 })
  quantiteDisponible: number;

  @Column({ name: 'derniere_mise_a_jour', default: () => 'CURRENT_TIMESTAMP' })
  derniereMiseAJour: Date;

  // Relations
  @ManyToOne(() => FournisseurSite, (site) => site.stocks)
  @JoinColumn({ name: 'fournisseur_site_id' })
  fournisseurSite: FournisseurSite;

  @ManyToOne(() => Article, (article) => article.stocksFournisseur)
  @JoinColumn({ name: 'article_id' })
  article: Article;
}