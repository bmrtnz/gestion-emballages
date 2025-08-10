import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { SupplierSite } from './supplier-site.entity';
import { SupplierContact } from './supplier-contact.entity';
import { ProductSupplier } from '@modules/products/entities/product-supplier.entity';
import { PurchaseOrder } from '@modules/orders/entities/purchase-order.entity';
import { Forecast } from '@modules/forecasts/entities/forecast.entity';

@Entity('suppliers')
export class Supplier extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  siret?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ name: 'postal_code', nullable: true })
  postalCode?: string;

  @Column({ nullable: true, default: 'France' })
  country?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ type: 'text', nullable: true })
  specialties?: string;

  // Note: Users are linked via polymorphic relationship (entiteType/entiteId)
  // No direct OneToMany relationship to avoid foreign key conflicts

  @OneToMany(() => SupplierSite, site => site.supplier)
  sites: SupplierSite[];

  @OneToMany(() => SupplierContact, contact => contact.supplier, { cascade: true })
  contacts: SupplierContact[];

  @OneToMany(() => ProductSupplier, productSupplier => productSupplier.supplier)
  productSuppliers: ProductSupplier[];

  @OneToMany(() => PurchaseOrder, purchaseOrder => purchaseOrder.supplier)
  purchaseOrders: PurchaseOrder[];

  @OneToMany(() => Forecast, forecast => forecast.supplier)
  forecasts: Forecast[];

  // Master contract relations (added to fix import issues)
  masterContracts?: Record<string, unknown>[]; // Will be properly typed when contracts module is fully implemented

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
