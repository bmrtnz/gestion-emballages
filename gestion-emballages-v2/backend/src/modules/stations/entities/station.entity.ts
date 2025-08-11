import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { SoftDeletableEntity } from '@common/entities/base.entity';
import { PurchaseOrder } from '@modules/orders/entities/purchase-order.entity';
import { MasterOrder } from '@modules/orders/entities/master-order.entity';
import { StockStation } from '@modules/stocks/entities/stock-station.entity';
import { TransferRequest } from '@modules/transfers/entities/transfer-request.entity';
import { Forecast } from '@modules/forecasts/entities/forecast.entity';
import { ShoppingCart } from '@modules/shopping-carts/entities/shopping-cart.entity';
import { StationGroup } from './station-group.entity';
import { StationContact } from './station-contact.entity';

@Entity('stations')
export class Station extends SoftDeletableEntity {
  @Column({ name: 'station_group_id', nullable: true })
  stationGroupId?: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  code?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ name: 'postal_code', nullable: true })
  postalCode?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ type: 'jsonb', nullable: true })
  coordinates?: {
    lat?: number;
    lng?: number;
    // Additional metadata can be stored here
    specialization?: string;
    productionVolume?: string;
    peakSeason?: string;
    [key: string]: any;
  };

  // Relations
  @ManyToOne(() => StationGroup, group => group.stations, { nullable: true })
  @JoinColumn({ name: 'station_group_id' })
  stationGroup?: StationGroup;

  @OneToMany(() => StationContact, contact => contact.station, { cascade: true })
  contacts: StationContact[];

  // Note: Users are linked via polymorphic relationship (entiteType/entiteId)
  // No direct OneToMany relationship to avoid foreign key conflicts

  @OneToMany(() => PurchaseOrder, purchaseOrder => purchaseOrder.station)
  purchaseOrders: PurchaseOrder[];

  @OneToMany(() => MasterOrder, masterOrder => masterOrder.station)
  masterOrders: MasterOrder[];

  // Alias for backward compatibility
  get globalOrders(): MasterOrder[] {
    return this.masterOrders;
  }

  @OneToMany(() => StockStation, stock => stock.station)
  stocks: StockStation[];

  @OneToMany(() => TransferRequest, demande => demande.requestingStationId)
  outgoingTransferRequests: TransferRequest[];

  @OneToMany(() => TransferRequest, demande => demande.sourceStationId)
  incomingTransferRequests: TransferRequest[];

  @OneToMany(() => Forecast, forecast => forecast.station)
  forecasts: Forecast[];

  @OneToMany(() => ShoppingCart, liste => liste.station)
  shoppingCarts: ShoppingCart[];

  // Virtual properties
  get principalContactFromContacts(): StationContact | undefined {
    return this.contacts?.find(contact => contact.isPrimary && contact.isActive);
  }

  get activeContacts(): StationContact[] {
    return this.contacts?.filter(contact => contact.isActive) || [];
  }

  get hasGroup(): boolean {
    return !!this.stationGroupId && !!this.stationGroup;
  }

  get isIndependent(): boolean {
    return !this.stationGroupId;
  }

  get fullNameWithGroup(): string {
    if (this.hasGroup && this.stationGroup) {
      return `${this.name} (${this.stationGroup.name})`;
    }
    return this.name;
  }

  get stationType(): 'grouped' | 'independent' {
    return this.hasGroup ? 'grouped' : 'independent';
  }

  // Backward compatibility getters
  get internalId(): string | undefined {
    return this.code;
  }

  set internalId(value: string | undefined) {
    this.code = value;
  }

  get groupId(): string | undefined {
    return this.stationGroupId;
  }

  set groupId(value: string | undefined) {
    this.stationGroupId = value;
  }

  get groupe(): StationGroup | undefined {
    return this.stationGroup;
  }

  set groupe(value: StationGroup | undefined) {
    this.stationGroup = value;
  }
}
