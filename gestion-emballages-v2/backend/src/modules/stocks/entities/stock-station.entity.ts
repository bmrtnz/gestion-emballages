import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Station } from '@modules/stations/entities/station.entity';
import { Product } from '@modules/products/entities/product.entity';
import { User } from '@modules/users/entities/user.entity';

@Entity('stock_stations')
@Unique(['stationId', 'articleId'])
export class StockStation extends BaseEntity {
  @Column({ name: 'station_id' })
  stationId: string;

  @Column({ name: 'product_id' })
  articleId: string;

  @Column({ name: 'quantity', default: 0 })
  quantiteActuelle: number;

  @Column({ name: 'minimum_stock', nullable: true })
  seuilAlerte?: number;

  @Column({ name: 'maximum_stock', nullable: true })
  seuilCritique?: number;

  @Column({ name: 'last_updated_by', nullable: true })
  updatedById?: string;

  // Note: derniereMiseAJour uses the inherited updatedAt from BaseEntity

  // Relations
  @ManyToOne(() => Station, station => station.stocks)
  @JoinColumn({ name: 'station_id' })
  station: Station;

  @ManyToOne(() => Product, product => product.stocksStation)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'last_updated_by' })
  lastUpdatedByUser?: User;

  // Backward compatibility getter/setter
  get derniereMiseAJour(): Date {
    return this.updatedAt;
  }

  set derniereMiseAJour(value: Date) {
    this.updatedAt = value;
  }
}
