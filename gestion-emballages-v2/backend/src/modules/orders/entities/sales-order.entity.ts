import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { OrderStatus } from '@common/enums/order-status.enum';
import { Station } from '@modules/stations/entities/station.entity';
import { Platform } from '@modules/platforms/entities/platform.entity';
import { User } from '@modules/users/entities/user.entity';
import { PurchaseOrder } from './purchase-order.entity';
import { SalesOrderProduct } from './sales-order-product.entity';

@Entity('sales_orders')
export class SalesOrder extends BaseEntity {
  @Column({ name: 'so_number', unique: true, length: 100 })
  soNumber: string;

  // This SO is always from Blue Whale (as seller)
  @Column({ name: 'seller_name', default: 'Blue Whale' })
  sellerName: string;

  // Customer information (always a station in this system)
  @Column({ name: 'customer_station_id' })
  customerStationId: string;

  @Column({ name: 'customer_po_number', length: 100 })
  customerPoNumber: string; // Reference to customer's PO

  // Fulfillment information
  @Column({ name: 'fulfillment_platform_id' })
  fulfillmentPlatformId: string; // Which platform will ship

  @Column({ name: 'delivery_address', type: 'text' })
  deliveryAddress: string;

  // Order details
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.ENREGISTREE,
  })
  status: OrderStatus;

  @Column({
    name: 'subtotal_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  subtotalAmount: number; // Product costs

  @Column({
    name: 'platform_fees',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  platformFees: number; // Platform service fees

  @Column({
    name: 'total_amount_excluding_tax',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalAmountExcludingTax: number; // subtotal + platform fees

  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  taxAmount: number;

  @Column({
    name: 'total_amount_including_tax',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalAmountIncludingTax: number;

  @Column({ name: 'currency', length: 3, default: 'EUR' })
  currency: string;

  // Dates
  @Column({ name: 'order_date', type: 'date' })
  orderDate: Date;

  @Column({ name: 'promised_delivery_date', type: 'date', nullable: true })
  promisedDeliveryDate?: Date;

  @Column({ name: 'actual_ship_date', type: 'date', nullable: true })
  actualShipDate?: Date;

  @Column({ name: 'actual_delivery_date', type: 'date', nullable: true })
  actualDeliveryDate?: Date;

  // Invoice information
  @Column({ name: 'invoice_number', length: 100, nullable: true })
  invoiceNumber?: string;

  @Column({ name: 'invoice_date', type: 'date', nullable: true })
  invoiceDate?: Date;

  @Column({ name: 'invoice_status', length: 50, nullable: true })
  invoiceStatus?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

  @Column({ name: 'payment_due_date', type: 'date', nullable: true })
  paymentDueDate?: Date;

  @Column({ name: 'payment_received_date', type: 'date', nullable: true })
  paymentReceivedDate?: Date;

  // Fulfillment tracking
  @Column({ name: 'picking_list_number', length: 100, nullable: true })
  pickingListNumber?: string;

  @Column({ name: 'shipping_tracking_number', length: 200, nullable: true })
  shippingTrackingNumber?: string;

  @Column({ name: 'carrier_name', length: 100, nullable: true })
  carrierName?: string;

  // Additional information
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'payment_terms', nullable: true })
  paymentTerms?: string;

  @Column({ name: 'created_by', nullable: true })
  createdById?: string;

  @Column({ name: 'fulfilled_by', nullable: true })
  fulfilledById?: string;

  @Column({ name: 'fulfilled_at', type: 'timestamp', nullable: true })
  fulfilledAt?: Date;

  // Relations
  @ManyToOne(() => Station)
  @JoinColumn({ name: 'customer_station_id' })
  customerStation: Station;

  @ManyToOne(() => Platform)
  @JoinColumn({ name: 'fulfillment_platform_id' })
  fulfillmentPlatform: Platform;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'fulfilled_by' })
  fulfilledBy?: User;

  @OneToOne(() => PurchaseOrder, purchaseOrder => purchaseOrder.linkedSalesOrder)
  linkedPurchaseOrder: PurchaseOrder;

  @OneToMany(() => SalesOrderProduct, salesOrderProduct => salesOrderProduct.salesOrder)
  salesOrderProducts: SalesOrderProduct[];
}
