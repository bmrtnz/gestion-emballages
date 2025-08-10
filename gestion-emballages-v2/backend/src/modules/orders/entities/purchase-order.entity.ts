import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { OrderStatus } from '@common/enums/order-status.enum';
import { Station } from '@modules/stations/entities/station.entity';
import { Supplier } from '@modules/suppliers/entities/supplier.entity';
import { Platform } from '@modules/platforms/entities/platform.entity';
import { User } from '@modules/users/entities/user.entity';
import { MasterOrder } from './master-order.entity';
import { PurchaseOrderProduct } from './purchase-order-product.entity';
import { SalesOrder } from './sales-order.entity';

@Entity('purchase_orders')
export class PurchaseOrder extends BaseEntity {
  @Column({ name: 'po_number', unique: true, length: 100 })
  poNumber: string;

  @Column({ name: 'master_order_id', nullable: true })
  masterOrderId?: string;

  // Buyer information
  @Column({ name: 'buyer_type', length: 50 })
  buyerType: 'BLUE_WHALE' | 'STATION'; // Who is creating the PO

  @Column({ name: 'station_id', nullable: true })
  stationId?: string; // If buyer is a station

  // Supplier information
  @Column({ name: 'supplier_id', nullable: true })
  supplierId?: string; // External supplier

  @Column({ name: 'is_internal_supplier', default: false })
  isInternalSupplier: boolean; // True when buying from Blue Whale

  // Delivery information
  @Column({ name: 'delivery_location_type', length: 50 })
  deliveryLocationType: 'PLATFORM' | 'STATION' | 'OTHER';

  @Column({ name: 'platform_id', nullable: true })
  platformId?: string; // Delivery platform if applicable

  @Column({ name: 'delivery_station_id', nullable: true })
  deliveryStationId?: string; // Final delivery station

  @Column({ name: 'delivery_address', type: 'text', nullable: true })
  deliveryAddress?: string; // Custom delivery address if needed

  // Order details
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.ENREGISTREE,
  })
  status: OrderStatus;

  @Column({
    name: 'total_amount_excluding_tax',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalAmountExcludingTax: number;

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

  @Column({ name: 'requested_delivery_date', type: 'date', nullable: true })
  requestedDeliveryDate?: Date;

  @Column({ name: 'confirmed_delivery_date', type: 'date', nullable: true })
  confirmedDeliveryDate?: Date;

  @Column({ name: 'actual_delivery_date', type: 'date', nullable: true })
  actualDeliveryDate?: Date;

  // Reference to linked Sales Order (when buying from Blue Whale)
  @Column({ name: 'linked_sales_order_id', nullable: true })
  linkedSalesOrderId?: string;

  // Additional information
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'payment_terms', nullable: true })
  paymentTerms?: string;

  @Column({ name: 'created_by', nullable: true })
  createdById?: string;

  @Column({ name: 'approved_by', nullable: true })
  approvedById?: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  // Relations
  @ManyToOne(() => MasterOrder, masterOrder => masterOrder.purchaseOrders, {
    nullable: true,
  })
  @JoinColumn({ name: 'master_order_id' })
  masterOrder?: MasterOrder;

  // Alias for backward compatibility
  get globalOrder(): MasterOrder | undefined {
    return this.masterOrder;
  }

  @ManyToOne(() => Station, { nullable: true })
  @JoinColumn({ name: 'station_id' })
  station?: Station;

  @ManyToOne(() => Station, { nullable: true })
  @JoinColumn({ name: 'delivery_station_id' })
  deliveryStation?: Station;

  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier?: Supplier;

  @ManyToOne(() => Platform, { nullable: true })
  @JoinColumn({ name: 'platform_id' })
  platform?: Platform;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedBy?: User;

  @OneToOne(() => SalesOrder, salesOrder => salesOrder.linkedPurchaseOrder, {
    nullable: true,
  })
  @JoinColumn({ name: 'linked_sales_order_id' })
  linkedSalesOrder?: SalesOrder;

  @OneToMany(() => PurchaseOrderProduct, purchaseOrderProduct => purchaseOrderProduct.purchaseOrder)
  orderProducts: PurchaseOrderProduct[];
}
