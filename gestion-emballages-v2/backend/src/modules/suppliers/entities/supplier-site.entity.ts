import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Supplier } from './supplier.entity';
import { StockSupplier } from '@modules/stocks/entities/stock-supplier.entity';

@Entity('supplier_sites')
export class SupplierSite extends BaseEntity {
  @Column({ name: 'supplier_id' })
  supplierId: string;

  @Column()
  name: string;

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

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  // Relations
  @ManyToOne(() => Supplier, supplier => supplier.sites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @OneToMany(() => StockSupplier, stock => stock.supplierSite)
  stocks: StockSupplier[];

  // Backward compatibility
  get isPrincipal(): boolean {
    return this.isPrimary;
  }

  set isPrincipal(value: boolean) {
    this.isPrimary = value;
  }
}
