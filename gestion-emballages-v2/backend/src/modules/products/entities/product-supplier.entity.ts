import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Product } from './product.entity';
import { Supplier } from '@modules/suppliers/entities/supplier.entity';
import { OrderProduct } from '@modules/orders/entities/order-product.entity';

@Entity('article_fournisseurs')
@Unique(['productId', 'supplierId'])
export class ProductSupplier extends BaseEntity {
  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'supplier_id' })
  supplierId: string;

  @Column({ name: 'supplier_reference', length: 100, nullable: true })
  supplierReference?: string;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ name: 'packaging_unit', length: 50, nullable: true })
  packagingUnit?: string;

  @Column({ name: 'quantity_per_package', nullable: true })
  quantityPerPackage?: number;

  @Column({ name: 'indicative_supply_delay', nullable: true })
  indicativeSupplyDelay?: number; // in working days

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl?: string;

  // Relations
  @ManyToOne(() => Product, (product) => product.productSuppliers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Supplier, (supplier) => supplier.productSuppliers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.productSupplier)
  orderProducts: OrderProduct[];
}