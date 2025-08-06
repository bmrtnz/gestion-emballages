import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Article } from './article.entity';
import { Fournisseur } from '@modules/fournisseurs/entities/fournisseur.entity';
import { CommandeArticle } from '@modules/commandes/entities/commande-article.entity';

@Entity('article_fournisseurs')
@Unique(['articleId', 'fournisseurId'])
export class ArticleFournisseur extends BaseEntity {
  @Column({ name: 'article_id' })
  articleId: string;

  @Column({ name: 'fournisseur_id' })
  fournisseurId: string;

  @Column({ name: 'reference_fournisseur', length: 100, nullable: true })
  referenceFournisseur?: string;

  @Column({ name: 'prix_unitaire', type: 'decimal', precision: 10, scale: 2 })
  prixUnitaire: number;

  @Column({ name: 'unite_conditionnement', length: 50, nullable: true })
  uniteConditionnement?: string;

  @Column({ name: 'quantite_par_conditionnement', nullable: true })
  quantiteParConditionnement?: number;

  @Column({ name: 'delai_indicatif_approvisionnement', nullable: true })
  delaiIndicatifApprovisionnement?: number; // in working days

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl?: string;

  // Relations
  @ManyToOne(() => Article, (article) => article.articleFournisseurs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @ManyToOne(() => Fournisseur, (fournisseur) => fournisseur.articleFournisseurs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fournisseur_id' })
  fournisseur: Fournisseur;

  @OneToMany(() => CommandeArticle, (commandeArticle) => commandeArticle.articleFournisseur)
  commandeArticles: CommandeArticle[];
}