import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { SupplierSite } from '@modules/suppliers/entities/supplier-site.entity';
import { Product } from '@modules/products/entities/product.entity';

@Entity('stock_fournisseurs')
@Unique(['fournisseurSiteId', 'articleId'])
export class StockSupplier extends BaseEntity {
  @Column({ name: 'fournisseur_site_id' })
  fournisseurSiteId: string;

  @Column({ name: 'product_id' })
  articleId: string;

  @Column({ name: 'quantite_disponible', default: 0 })
  quantiteDisponible: number;

  @Column({ name: 'derniere_mise_a_jour', default: () => 'CURRENT_TIMESTAMP' })
  derniereMiseAJour: Date;

  // Relations
  @ManyToOne(() => SupplierSite, site => site.stocks)
  @JoinColumn({ name: 'fournisseur_site_id' })
  supplierSite: SupplierSite;

  @ManyToOne(() => Product, product => product.stocksFournisseur)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
