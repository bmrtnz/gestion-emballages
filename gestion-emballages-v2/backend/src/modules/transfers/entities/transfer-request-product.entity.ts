import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { TransferRequest } from './transfer-request.entity';
import { Product } from '@modules/products/entities/product.entity';

@Entity('demande_transfert_articles')
export class TransferRequestProduct extends BaseEntity {
  @Column({ name: 'demande_transfert_id' })
  transferRequestId: string;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ name: 'requested_quantity' })
  requestedQuantity: number;

  @Column({ name: 'quantite_accordee', nullable: true })
  grantedQuantity?: number;

  @Column({ name: 'delivered_quantity', nullable: true })
  deliveredQuantity?: number;

  // Relations
  @ManyToOne(() => TransferRequest, transferRequest => transferRequest.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'demande_transfert_id' })
  transferRequest: TransferRequest;

  @ManyToOne(() => Product, product => product.transferRequests)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
