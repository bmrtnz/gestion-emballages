import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Supplier } from './supplier.entity';
import { StockSupplier } from '@modules/stocks/entities/stock-supplier.entity';

@Entity('fournisseur_sites')
export class SupplierSite extends BaseEntity {
  @Column({ name: 'supplier_id' })
  supplierId: string;

  @Column()
  name: string;

  @Column({ type: 'jsonb', default: {} })
  address: {
    street?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };

  @Column({ name: 'is_principal', default: false })
  isPrincipal: boolean;

  // Relations
  @ManyToOne(() => Supplier, (supplier) => supplier.sites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @OneToMany(() => StockSupplier, (stock) => stock.supplierSite)
  stocks: StockSupplier[];
}