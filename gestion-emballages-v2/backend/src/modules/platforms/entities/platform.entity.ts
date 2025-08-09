import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { User } from '@modules/users/entities/user.entity';
import { PlatformContact } from './platform-contact.entity';
import { Order } from '@modules/orders/entities/order.entity';
import { StockPlatform } from '@modules/stocks/entities/stock-platform.entity';

@Entity('platforms')
export class Platform extends BaseEntity {
  @Column()
  name: string;

  @Column({ length: 50, nullable: true })
  type?: string;

  @Column({ type: 'text', array: true, default: [] })
  specialties: string[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdById?: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedById?: string;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: User;

  @OneToMany(() => PlatformContact, (contact) => contact.platform, { cascade: true })
  contacts: PlatformContact[];

  @OneToMany(() => Order, (order) => order.platform)
  orders: Order[];

  @OneToMany(() => StockPlatform, (stock) => stock.platform)
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