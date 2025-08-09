import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Product } from '@modules/products/entities/product.entity';
import { Platform } from '@modules/platforms/entities/platform.entity';
import { PlatformSite } from '@modules/platforms/entities/platform-site.entity';
import { User } from '@modules/users/entities/user.entity';

@Entity('stocks_platform')
@Index(['platformId', 'articleId', 'platformSiteId'], { unique: true })
export class StockPlatform extends BaseEntity {
  @Column({ name: 'platform_id' })
  platformId: string;

  @Column({ name: 'product_id' })
  articleId: string;

  @Column({ name: 'platform_site_id', nullable: true })
  platformSiteId?: string;

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
  @ManyToOne(() => Platform, (platform) => platform.stocks)
  @JoinColumn({ name: 'platform_id' })
  platform: Platform;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => PlatformSite, (site) => site.stocks, { nullable: true })
  @JoinColumn({ name: 'platform_site_id' })
  platformSite?: PlatformSite;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: User;
}