import { Column, Entity, OneToMany } from 'typeorm';
import { SoftDeletableEntity } from '@common/entities/base.entity';
import { PlatformContact } from './platform-contact.entity';
import { PurchaseOrder } from '@modules/orders/entities/purchase-order.entity';
import { StockPlatform } from '@modules/stocks/entities/stock-platform.entity';

@Entity('platforms')
export class Platform extends SoftDeletableEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ name: 'postal_code', nullable: true })
  postalCode?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  specialties?: string;

  // Relations
  @OneToMany(() => PlatformContact, contact => contact.platform, { cascade: true })
  contacts: PlatformContact[];

  @OneToMany(() => PurchaseOrder, purchaseOrder => purchaseOrder.platform)
  purchaseOrders: PurchaseOrder[];

  @OneToMany(() => StockPlatform, stock => stock.platform)
  stocks: StockPlatform[];

  // Virtual properties
  get principalContactFromContacts(): PlatformContact | undefined {
    return this.contacts?.find(contact => contact.isPrincipal && contact.isActive);
  }

  get activeContacts(): PlatformContact[] {
    return this.contacts?.filter(contact => contact.isActive) || [];
  }

  get hasContacts(): boolean {
    return this.activeContacts.length > 0;
  }
}
