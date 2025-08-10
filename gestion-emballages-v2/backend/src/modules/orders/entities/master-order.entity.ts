import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { OrderStatus } from '@common/enums/order-status.enum';
import { Station } from '@modules/stations/entities/station.entity';
import { User } from '@modules/users/entities/user.entity';
import { PurchaseOrder } from './purchase-order.entity';

@Entity('master_orders')
export class MasterOrder extends BaseEntity {
  @Column({ name: 'reference_master', unique: true, length: 100 })
  referenceMaster: string;

  @Column({ name: 'station_id' })
  stationId: string;

  @Column({
    name: 'statut_general',
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.ENREGISTREE,
  })
  statutGeneral: OrderStatus;

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

  @Column({ name: 'order_date', type: 'date' })
  orderDate: Date;

  @Column({ name: 'shopping_cart_id', nullable: true })
  shoppingCartId?: string; // Reference to originating shopping cart

  @Column({ name: 'supplier_count', type: 'int', default: 0 })
  supplierCount: number; // Number of suppliers in this master order

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'created_by', nullable: true })
  createdById?: string;

  // Relations
  @ManyToOne(() => Station, station => station.globalOrders)
  @JoinColumn({ name: 'station_id' })
  station: Station;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @OneToMany(() => PurchaseOrder, purchaseOrder => purchaseOrder.masterOrder)
  purchaseOrders: PurchaseOrder[];

  // Backward compatibility for old Order entity
  get commandes(): PurchaseOrder[] {
    return this.purchaseOrders || [];
  }

  // Virtual properties for Master Order functionality
  get childOrdersCount(): number {
    return this.purchaseOrders?.length || 0;
  }

  get isMultiSupplierOrder(): boolean {
    return this.supplierCount > 1;
  }

  get overallProgress(): string {
    if (!this.purchaseOrders?.length) return 'No child orders';

    const statuses = this.purchaseOrders.map(po => po.status);
    const uniqueStatuses = [...new Set(statuses)];

    if (uniqueStatuses.length === 1) {
      return `All orders: ${uniqueStatuses[0]}`;
    }

    return `Mixed progress across ${statuses.length} suppliers`;
  }

  get supplierList(): string[] {
    return this.purchaseOrders?.map(po => po.supplier?.name).filter(Boolean) || [];
  }
}
