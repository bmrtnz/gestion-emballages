import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Commande } from './commande.entity';
import { Article } from '@modules/articles/entities/article.entity';
import { ArticleFournisseur } from '@modules/articles/entities/article-fournisseur.entity';

@Entity('commande_articles')
export class CommandeArticle extends BaseEntity {
  @Column({ name: 'commande_id' })
  commandeId: string;

  @Column({ name: 'article_id' })
  articleId: string;

  @Column({ name: 'article_fournisseur_id' })
  articleFournisseurId: string;

  @Column({ name: 'quantite_commandee' })
  quantiteCommandee: number;

  @Column({ name: 'prix_unitaire', type: 'decimal', precision: 10, scale: 2 })
  prixUnitaire: number;

  @Column({ name: 'unite_conditionnement', length: 50, nullable: true })
  uniteConditionnement?: string;

  @Column({ name: 'quantite_par_conditionnement', nullable: true })
  quantiteParConditionnement?: number;

  @Column({ name: 'reference_fournisseur', length: 100, nullable: true })
  referenceFournisseur?: string;

  @Column({ name: 'date_souhaitee_livraison', type: 'date', nullable: true })
  dateSouhaitee_livraison?: Date;

  // Relations
  @ManyToOne(() => Commande, (commande) => commande.commandeArticles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'commande_id' })
  commande: Commande;

  @ManyToOne(() => Article, (article) => article.commandeArticles)
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @ManyToOne(() => ArticleFournisseur, (articleFournisseur) => articleFournisseur.commandeArticles)
  @JoinColumn({ name: 'article_fournisseur_id' })
  articleFournisseur: ArticleFournisseur;
}