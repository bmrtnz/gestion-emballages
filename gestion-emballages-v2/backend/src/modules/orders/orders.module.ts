import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { MasterOrder } from './entities/master-order.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { SalesOrder } from './entities/sales-order.entity';
import { OrderProduct } from './entities/order-product.entity';
import { SalesOrderProduct } from './entities/sales-order-product.entity';
import { PaginationService } from '@common/services/pagination.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      MasterOrder,
      PurchaseOrder,
      SalesOrder,
      OrderProduct,
      SalesOrderProduct
    ])
  ],
  controllers: [OrdersController],
  providers: [OrdersService, PaginationService],
  exports: [OrdersService]
})
export class OrdersModule {}