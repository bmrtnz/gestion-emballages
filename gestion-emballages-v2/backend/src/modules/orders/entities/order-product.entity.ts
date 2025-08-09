import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { PurchaseOrder } from './purchase-order.entity';
import { Product } from '@modules/products/entities/product.entity';
import { ProductSupplier } from '@modules/products/entities/product-supplier.entity';

@Entity('purchase_order_products')
export class OrderProduct extends BaseEntity {
  @Column({ name: 'purchase_order_id' })
  purchaseOrderId: string;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'article_supplier_id' })
  productSupplierId: string;

  @Column({ name: 'ordered_quantity' })
  orderedQuantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ name: 'packaging_unit', length: 50, nullable: true })
  packagingUnit?: string;

  @Column({ name: 'quantity_per_package', nullable: true })
  quantityPerPackage?: number;

  @Column({ name: 'supplier_reference', length: 100, nullable: true })
  supplierReference?: string;

  @Column({ name: 'desired_delivery_date', type: 'date', nullable: true })
  desiredDeliveryDate?: Date;

  // Relations
  @ManyToOne(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.orderProducts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder: PurchaseOrder;

  @ManyToOne(() => Product, (product) => product.orderProducts)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => ProductSupplier, (productSupplier) => productSupplier.orderProducts)
  @JoinColumn({ name: 'product_supplier_id' })
  productSupplier: ProductSupplier;

  // Backward compatibility
  get order(): PurchaseOrder {
    return this.purchaseOrder;
  }
}