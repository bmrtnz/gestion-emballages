import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ShoppingCartsService } from './shopping-carts.service';
import { ShoppingCartsController } from './shopping-carts.controller';
import { ShoppingCart } from './entities/shopping-cart.entity';
import { ShoppingCartItem } from './entities/shopping-cart-item.entity';
import { PaginationService } from '@common/services/pagination.service';

// Import related entities for validation
import { Product } from '@modules/products/entities/product.entity';
import { Supplier } from '@modules/suppliers/entities/supplier.entity';
import { Station } from '@modules/stations/entities/station.entity';
import { Order } from '@modules/orders/entities/order.entity';
import { OrderProduct } from '@modules/orders/entities/order-product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShoppingCart,
      ShoppingCartItem,
      Product,
      Supplier,
      Station,
      Order,
      OrderProduct
    ])
  ],
  controllers: [ShoppingCartsController],
  providers: [ShoppingCartsService, PaginationService],
  exports: [ShoppingCartsService]
})
export class ShoppingCartsModule {}