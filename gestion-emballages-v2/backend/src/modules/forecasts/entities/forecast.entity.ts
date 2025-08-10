import { Check, Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Station } from '@modules/stations/entities/station.entity';
import { Product } from '@modules/products/entities/product.entity';
import { Supplier } from '@modules/suppliers/entities/supplier.entity';
import { User } from '@modules/users/entities/user.entity';

@Entity('forecasts')
@Unique(['campaign', 'stationId', 'productId', 'supplierId', 'week'])
@Check('check_week_range', 'week BETWEEN 1 AND 52')
export class Forecast extends BaseEntity {
  @Column({ length: 10 })
  campaign: string; // e.g., '25-26'

  @Column({ name: 'station_id' })
  stationId: string;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'supplier_id' })
  supplierId: string;

  @Column()
  week: number; // 1-52

  @Column({ name: 'forecast_quantity' })
  forecastQuantity: number;

  @Column({ name: 'created_by', nullable: true })
  createdById?: string;

  // Relations
  @ManyToOne(() => Station, station => station.forecasts)
  @JoinColumn({ name: 'station_id' })
  station: Station;

  @ManyToOne(() => Product, product => product.forecasts)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Supplier, supplier => supplier.forecasts)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;
}
