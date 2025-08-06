import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { ListeAchat } from './liste-achat.entity';
import { Article } from '@modules/articles/entities/article.entity';
import { Fournisseur } from '@modules/fournisseurs/entities/fournisseur.entity';

@Entity('liste_achat_items')
@Unique(['listeAchatId', 'articleId', 'fournisseurId'])
export class ListeAchatItem extends BaseEntity {
  @Column({ name: 'liste_achat_id' })
  listeAchatId: string;

  @Column({ name: 'article_id' })
  articleId: string;

  @Column({ name: 'fournisseur_id' })
  fournisseurId: string;

  @Column()
  quantite: number;

  @Column({ name: 'date_souhaitee_livraison', type: 'date', nullable: true })
  dateSouhaitee_livraison?: Date;

  // Relations
  @ManyToOne(() => ListeAchat, (liste) => liste.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'liste_achat_id' })
  listeAchat: ListeAchat;

  @ManyToOne(() => Article, (article) => article.listeAchatItems)
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @ManyToOne(() => Fournisseur, (fournisseur) => fournisseur)
  @JoinColumn({ name: 'fournisseur_id' })
  fournisseur: Fournisseur;
}