import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Product } from './product.entity';
import { Supplier } from '@modules/suppliers/entities/supplier.entity';
import { PurchaseOrderProduct } from '@modules/orders/entities/purchase-order-product.entity';
import { ConditioningUnit } from '@common/enums/conditioning-unit.enum';

@Entity('product_suppliers')
@Unique(['productId', 'supplierId'])
export class ProductSupplier extends BaseEntity {
  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'supplier_id' })
  supplierId: string;

  @Column({ name: 'supplier_product_code', length: 100, nullable: true })
  supplierProductCode?: string;

  @Column({ name: 'conditioning_price', type: 'decimal', precision: 10, scale: 2 })
  conditioningPrice: number;

  @Column({ name: 'conditioning_unit', type: 'enum', enum: ConditioningUnit, nullable: true })
  conditioningUnit?: ConditioningUnit;

  @Column({ name: 'quantity_per_conditioning', nullable: true })
  quantityPerConditioning?: number;

  @Column({ name: 'indicative_supply_delay', nullable: true })
  indicativeSupplyDelay?: number; // in working days

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl?: string;

  // Relations
  @ManyToOne(() => Product, product => product.productSuppliers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Supplier, supplier => supplier.productSuppliers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @OneToMany(() => PurchaseOrderProduct, purchaseOrderProduct => purchaseOrderProduct.productSupplier)
  orderProducts: PurchaseOrderProduct[];
}
