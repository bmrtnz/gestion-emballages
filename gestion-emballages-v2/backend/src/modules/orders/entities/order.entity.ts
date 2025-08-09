import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { OrderStatus } from '@common/enums/order-status.enum';
import { Station } from '@modules/stations/entities/station.entity';
import { Supplier } from '@modules/suppliers/entities/supplier.entity';
import { Platform } from '@modules/platforms/entities/platform.entity';
import { User } from '@modules/users/entities/user.entity';
import { MasterOrder } from './master-order.entity';
import { OrderProduct } from './order-product.entity';

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ name: 'order_number', unique: true, length: 100 })
  orderNumber: string;

  @Column({ name: 'global_order_id', nullable: true })
  globalOrderId?: string;

  @Column({ name: 'station_id' })
  stationId: string;

  @Column({ name: 'supplier_id' })
  supplierId: string;

  @Column({ name: 'platform_id', nullable: true })
  platformId?: string;

  @Column({ name: 'is_platform_delivery', default: false })
  isPlatformDelivery: boolean;

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

  @Column({ name: 'expected_delivery_date', type: 'date', nullable: true })
  expectedDeliveryDate?: Date;

  @Column({ name: 'actual_delivery_date', type: 'date', nullable: true })
  actualDeliveryDate?: Date;

  @Column({ name: 'created_by', nullable: true })
  createdById?: string;

  // Relations
  @ManyToOne(() => MasterOrder, (masterOrder) => masterOrder.commandes, {
    nullable: true,
  })
  @JoinColumn({ name: 'global_order_id' })
  globalOrder?: MasterOrder;

  @ManyToOne(() => Station, (station) => station.orders)
  @JoinColumn({ name: 'station_id' })
  station: Station;

  @ManyToOne(() => Supplier, (supplier) => supplier.orders)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @ManyToOne(() => Platform, (platform) => platform.orders, { nullable: true })
  @JoinColumn({ name: 'platform_id' })
  platform?: Platform;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order)
  orderProducts: OrderProduct[];
}