import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Product } from '@modules/products/entities/product.entity';
import { Platform } from '@modules/platforms/entities/platform.entity';
import { PlatformSite } from '@modules/platforms/entities/platform-site.entity';
import { User } from '@modules/users/entities/user.entity';

@Entity('stock_platforms')
@Index(['platformId', 'articleId'], { unique: true })
export class StockPlatform extends BaseEntity {
  @Column({ name: 'platform_id' })
  platformId: string;

  @Column({ name: 'product_id' })
  articleId: string;

  // platform_site_id column doesn't exist in actual database table

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  quantite: number;

  @Column({ name: 'stock_minimum', type: 'decimal', precision: 10, scale: 2, nullable: true })
  stockMinimum?: number;

  @Column({ name: 'stock_maximum', type: 'decimal', precision: 10, scale: 2, nullable: true })
  stockMaximum?: number;

  @Column({ name: 'is_point_in_time', default: false })
  isPointInTime: boolean;

  @Column({ name: 'snapshot_date', type: 'timestamp', nullable: true })
  snapshotDate?: Date;

  @Column({ name: 'updated_by', nullable: true })
  updatedById?: string;

  // Relations
  @ManyToOne(() => Platform, platform => platform.stocks)
  @JoinColumn({ name: 'platform_id' })
  platform: Platform;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  // Temporary property for TypeScript compatibility (actual column doesn't exist)
  platformSite?: any;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: User;
}
