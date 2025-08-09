import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Platform } from './platform.entity';
import { StockPlatform } from '@modules/stocks/entities/stock-platform.entity';

@Entity('platform_sites')
export class PlatformSite extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ name: 'code_postal', nullable: true })
  postalCode?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ name: 'is_principal', default: false })
  isPrincipal: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'platform_id' })
  platformId: string;

  // Relations
  @ManyToOne(() => Platform)
  @JoinColumn({ name: 'platform_id' })
  platform: Platform;

  @OneToMany(() => StockPlatform, (stock) => stock.platformSite)
  stocks: StockPlatform[];
}