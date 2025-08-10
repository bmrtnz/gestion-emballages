import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { SalesOrder } from './sales-order.entity';
import { Product } from '@modules/products/entities/product.entity';

@Entity('sales_order_products')
export class SalesOrderProduct extends BaseEntity {
  @Column({ name: 'sales_order_id' })
  salesOrderId: string;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'line_number', type: 'int' })
  lineNumber: number;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ name: 'discount_percent', type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'line_total', type: 'decimal', precision: 12, scale: 2 })
  lineTotal: number; // (quantity * unitPrice) - discountAmount

  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 2, default: 20 })
  taxRate: number; // VAT rate

  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2 })
  taxAmount: number;

  @Column({ name: 'line_total_with_tax', type: 'decimal', precision: 12, scale: 2 })
  lineTotalWithTax: number;

  // Stock information
  @Column({ name: 'stock_location', length: 100, nullable: true })
  stockLocation?: string; // Where to pick from in the platform

  @Column({ name: 'batch_number', length: 100, nullable: true })
  batchNumber?: string;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: Date;

  // Fulfillment status
  @Column({ name: 'quantity_shipped', type: 'int', default: 0 })
  quantityShipped: number;

  @Column({ name: 'quantity_delivered', type: 'int', default: 0 })
  quantityDelivered: number;

  @Column({ name: 'fulfillment_status', length: 50, default: 'PENDING' })
  fulfillmentStatus: 'PENDING' | 'PICKED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  // Relations
  @ManyToOne(() => SalesOrder, salesOrder => salesOrder.salesOrderProducts)
  @JoinColumn({ name: 'sales_order_id' })
  salesOrder: SalesOrder;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
