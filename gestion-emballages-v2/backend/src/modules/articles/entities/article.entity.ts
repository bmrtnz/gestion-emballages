import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { ArticleCategory } from '@common/enums/article-category.enum';
import { User } from '@modules/users/entities/user.entity';
import { ArticleFournisseur } from './article-fournisseur.entity';
import { CommandeArticle } from '@modules/commandes/entities/commande-article.entity';
import { StockStation } from '@modules/stocks/entities/stock-station.entity';
import { StockFournisseur } from '@modules/stocks/entities/stock-fournisseur.entity';
import { DemandeTransfertArticle } from '@modules/transferts/entities/demande-transfert-article.entity';
import { Prevision } from '@modules/previsions/entities/prevision.entity';
import { ListeAchatItem } from '@modules/listes-achat/entities/liste-achat-item.entity';

@Entity('articles')
export class Article extends BaseEntity {
  @Column({ name: 'code_article', unique: true, length: 100 })
  codeArticle: string;

  @Column()
  designation: string;

  @Column({
    type: 'enum',
    enum: ArticleCategory,
  })
  categorie: ArticleCategory;

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

  @OneToMany(() => ArticleFournisseur, (articleFournisseur) => articleFournisseur.article)
  articleFournisseurs: ArticleFournisseur[];

  @OneToMany(() => CommandeArticle, (commandeArticle) => commandeArticle.article)
  commandeArticles: CommandeArticle[];

  @OneToMany(() => StockStation, (stock) => stock.article)
  stocksStation: StockStation[];

  @OneToMany(() => StockFournisseur, (stock) => stock.article)
  stocksFournisseur: StockFournisseur[];

  @OneToMany(() => DemandeTransfertArticle, (demande) => demande.article)
  demandesTransfert: DemandeTransfertArticle[];

  @OneToMany(() => Prevision, (prevision) => prevision.article)
  previsions: Prevision[];

  @OneToMany(() => ListeAchatItem, (item) => item.article)
  listeAchatItems: ListeAchatItem[];
}