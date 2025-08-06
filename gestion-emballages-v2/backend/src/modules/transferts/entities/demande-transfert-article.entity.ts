import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { DemandeTransfert } from './demande-transfert.entity';
import { Article } from '@modules/articles/entities/article.entity';

@Entity('demande_transfert_articles')
export class DemandeTransfertArticle extends BaseEntity {
  @Column({ name: 'demande_transfert_id' })
  demandeTransfertId: string;

  @Column({ name: 'article_id' })
  articleId: string;

  @Column({ name: 'quantite_demandee' })
  quantiteDemandee: number;

  @Column({ name: 'quantite_accordee', nullable: true })
  quantiteAccordee?: number;

  @Column({ name: 'quantite_livree', nullable: true })
  quantiteLivree?: number;

  // Relations
  @ManyToOne(() => DemandeTransfert, (demande) => demande.articles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'demande_transfert_id' })
  demandeTransfert: DemandeTransfert;

  @ManyToOne(() => Article, (article) => article.demandesTransfert)
  @JoinColumn({ name: 'article_id' })
  article: Article;
}