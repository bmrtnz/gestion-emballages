import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Platform } from './platform.entity';
import { StockPlatform } from '@modules/stocks/entities/stock-platform.entity';

@Entity('platform_sites')
export class PlatformSite extends BaseEntity {
  @Column()
  nom: string;

  @Column({ nullable: true })
  adresse?: string;

  @Column({ nullable: true })
  ville?: string;

  @Column({ name: 'code_postal', nullable: true })
  codePostal?: string;

  @Column({ nullable: true })
  telephone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ name: 'is_principal', default: false })
  isPrincipal: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'platform_id' })
  platformId: string;

  // Relations
  @ManyToOne(() => Platform, (platform) => platform.sites)
  @JoinColumn({ name: 'platform_id' })
  platform: Platform;

  @OneToMany(() => StockPlatform, (stock) => stock.platformSite)
  stocks: StockPlatform[];
}