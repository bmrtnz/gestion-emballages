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
import { PurchaseOrder } from '@modules/orders/entities/purchase-order.entity';
import { PurchaseOrderProduct } from '@modules/orders/entities/purchase-order-product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShoppingCart,
      ShoppingCartItem,
      Product,
      Supplier,
      Station,
      PurchaseOrder,
      PurchaseOrderProduct,
    ]),
  ],
  controllers: [ShoppingCartsController],
  providers: [ShoppingCartsService, PaginationService],
  exports: [ShoppingCartsService],
})
export class ShoppingCartsModule {}
