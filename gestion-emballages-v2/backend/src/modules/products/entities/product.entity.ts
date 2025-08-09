import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { ProductCategory } from '@common/enums/product-category.enum';
import { User } from '@modules/users/entities/user.entity';
import { ProductSupplier } from './product-supplier.entity';
import { OrderProduct } from '@modules/orders/entities/order-product.entity';
import { StockStation } from '@modules/stocks/entities/stock-station.entity';
import { StockSupplier } from '@modules/stocks/entities/stock-supplier.entity';
import { TransferRequestProduct } from '@modules/transfers/entities/transfer-request-product.entity';
import { Forecast } from '@modules/forecasts/entities/forecast.entity';
import { ShoppingCartItem } from '@modules/shopping-carts/entities/shopping-cart-item.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ name: 'product_code', unique: true, length: 100 })
  productCode: string;

  @Column({ length: 255, nullable: true })
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: ProductCategory,
  })
  category: ProductCategory;

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

  @OneToMany(() => ProductSupplier, (productSupplier) => productSupplier.product)
  productSuppliers: ProductSupplier[];

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.product)
  orderProducts: OrderProduct[];

  @OneToMany(() => StockStation, (stock) => stock.product)
  stocksStation: StockStation[];

  @OneToMany(() => StockSupplier, (stock) => stock.product)
  stocksFournisseur: StockSupplier[];

  @OneToMany(() => TransferRequestProduct, (transferRequestProduct) => transferRequestProduct.product)
  transferRequests: TransferRequestProduct[];

  @OneToMany(() => Forecast, (forecast) => forecast.product)
  forecasts: Forecast[];

  @OneToMany(() => ShoppingCartItem, (item) => item.product)
  listeAchatItems: ShoppingCartItem[];
}