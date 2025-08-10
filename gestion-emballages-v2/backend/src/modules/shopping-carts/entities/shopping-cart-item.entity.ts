import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { ShoppingCart } from './shopping-cart.entity';
import { Product } from '@modules/products/entities/product.entity';
import { Supplier } from '@modules/suppliers/entities/supplier.entity';

@Entity('liste_achat_items')
@Unique(['listeAchatId', 'articleId', 'supplierId'])
export class ShoppingCartItem extends BaseEntity {
  @Column({ name: 'shopping_cart_id' })
  listeAchatId: string;

  @Column({ name: 'product_id' })
  articleId: string;

  @Column({ name: 'supplier_id' })
  supplierId: string;

  @Column()
  quantite: number;

  @Column({ name: 'date_souhaitee_livraison', type: 'date', nullable: true })
  dateSouhaitee_livraison?: Date;

  // Relations
  @ManyToOne(() => ShoppingCart, liste => liste.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shopping_cart_id' })
  shoppingCart: ShoppingCart;

  @ManyToOne(() => Product, product => product.listeAchatItems)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;
}
