import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { SalesOrdersService } from './sales-orders.service';
import { SalesOrdersController } from './sales-orders.controller';
import { MasterOrder } from './entities/master-order.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { SalesOrder } from './entities/sales-order.entity';
import { PurchaseOrderProduct } from './entities/purchase-order-product.entity';
import { SalesOrderProduct } from './entities/sales-order-product.entity';
import { PaginationService } from '@common/services/pagination.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MasterOrder, PurchaseOrder, SalesOrder, PurchaseOrderProduct, SalesOrderProduct]),
  ],
  controllers: [PurchaseOrdersController, SalesOrdersController],
  providers: [PurchaseOrdersService, SalesOrdersService, PaginationService],
  exports: [PurchaseOrdersService, SalesOrdersService],
})
export class OrdersModule {}
