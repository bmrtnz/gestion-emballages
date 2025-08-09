import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { User } from '@modules/users/entities/user.entity';
import { Order } from '@modules/orders/entities/order.entity';
import { MasterOrder } from '@modules/orders/entities/master-order.entity';
import { StockStation } from '@modules/stocks/entities/stock-station.entity';
import { TransferRequest } from '@modules/transfers/entities/transfer-request.entity';
import { Forecast } from '@modules/forecasts/entities/forecast.entity';
import { ShoppingCart } from '@modules/shopping-carts/entities/shopping-cart.entity';
import { StationGroup } from './station-group.entity';
import { StationContact } from './station-contact.entity';

@Entity('stations')
export class Station extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: 'internal_id', nullable: true })
  internalId?: string;

  @Column({ type: 'jsonb', default: {} })
  address: {
    street?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };

  @Column({ name: 'group_id', nullable: true })
  groupId?: string; // NULL for independent stations that don't belong to any group

  @Column({ name: 'main_contact', type: 'jsonb', default: {} })
  mainContact: {
    name?: string;
    phone?: string;
    email?: string;
  };

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdById?: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedById?: string;

  // Relations
  @ManyToOne(() => StationGroup, (groupe) => groupe.stations, { nullable: true })
  @JoinColumn({ name: 'group_id' })
  groupe?: StationGroup;

  @OneToMany(() => StationContact, (contact) => contact.station, { cascade: true })
  contacts: StationContact[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: User;

  // Note: Users are linked via polymorphic relationship (entiteType/entiteId)
  // No direct OneToMany relationship to avoid foreign key conflicts

  @OneToMany(() => Order, (order) => order.station)
  orders: Order[];

  @OneToMany(() => MasterOrder, (masterOrder) => masterOrder.station)
  masterOrders: MasterOrder[];

  // Alias for backward compatibility
  get globalOrders(): MasterOrder[] {
    return this.masterOrders;
  }

  @OneToMany(() => StockStation, (stock) => stock.station)
  stocks: StockStation[];

  @OneToMany(() => TransferRequest, (demande) => demande.requestingStationId)
  outgoingTransferRequests: TransferRequest[];

  @OneToMany(() => TransferRequest, (demande) => demande.sourceStationId)
  incomingTransferRequests: TransferRequest[];

  @OneToMany(() => Forecast, (forecast) => forecast.station)
  forecasts: Forecast[];

  @OneToMany(() => ShoppingCart, (liste) => liste.station)
  shoppingCarts: ShoppingCart[];

  // Virtual properties
  get principalContactFromContacts(): StationContact | undefined {
    return this.contacts?.find(contact => contact.isPrincipal && contact.isActive);
  }

  get activeContacts(): StationContact[] {
    return this.contacts?.filter(contact => contact.isActive) || [];
  }

  get hasGroup(): boolean {
    return !!this.groupId && !!this.groupe;
  }

  get isIndependent(): boolean {
    return !this.groupId;
  }

  get fullNameWithGroup(): string {
    if (this.hasGroup && this.groupe) {
      return `${this.name} (${this.groupe.name})`;
    }
    return this.name;
  }

  get stationType(): 'grouped' | 'independent' {
    return this.hasGroup ? 'grouped' : 'independent';
  }
}