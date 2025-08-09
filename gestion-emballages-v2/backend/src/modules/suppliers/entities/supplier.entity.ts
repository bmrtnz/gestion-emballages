import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { User } from '@modules/users/entities/user.entity';
import { SupplierSite } from './supplier-site.entity';
import { SupplierContact } from './supplier-contact.entity';
import { ProductSupplier } from '@modules/products/entities/product-supplier.entity';
import { Order } from '@modules/orders/entities/order.entity';
import { Forecast } from '@modules/forecasts/entities/forecast.entity';

@Entity('suppliers')
export class Supplier extends BaseEntity {
  @Column()
  name: string;

  @Column({ length: 14, nullable: true })
  siret?: string;

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

  // Note: Users are linked via polymorphic relationship (entiteType/entiteId)
  // No direct OneToMany relationship to avoid foreign key conflicts

  @OneToMany(() => SupplierSite, (site) => site.supplier)
  sites: SupplierSite[];

  @OneToMany(() => SupplierContact, (contact) => contact.supplier, { cascade: true })
  contacts: SupplierContact[];

  @OneToMany(() => ProductSupplier, (productSupplier) => productSupplier.supplier)
  productSuppliers: ProductSupplier[];

  @OneToMany(() => Order, (order) => order.supplier)
  orders: Order[];

  @OneToMany(() => Forecast, (forecast) => forecast.supplier)
  forecasts: Forecast[];

  // Master contract relations (added to fix import issues)
  masterContracts?: any[]; // Will be properly typed when contracts module is fully implemented

  // Virtual properties
  get principalContactFromContacts(): SupplierContact | undefined {
    return this.contacts?.find(contact => contact.isPrincipal && contact.isActive);
  }

  get activeContacts(): SupplierContact[] {
    return this.contacts?.filter(contact => contact.isActive) || [];
  }

  get hasContacts(): boolean {
    return this.activeContacts.length > 0;
  }
}