import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Station } from '@modules/stations/entities/station.entity';
import { User } from '@modules/users/entities/user.entity';
import { ShoppingCartItem } from './shopping-cart-item.entity';

@Entity('liste_achats')
export class ShoppingCart extends BaseEntity {
  @Column({ name: 'station_id' })
  stationId: string;

  @Column({ length: 50, default: 'active' })
  status: string;

  @Column({ name: 'created_by', nullable: true })
  createdById?: string;

  // Relations
  @ManyToOne(() => Station, (station) => station.shoppingCarts)
  @JoinColumn({ name: 'station_id' })
  station: Station;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @OneToMany(() => ShoppingCartItem, (item) => item.shoppingCart)
  items: ShoppingCartItem[];
}