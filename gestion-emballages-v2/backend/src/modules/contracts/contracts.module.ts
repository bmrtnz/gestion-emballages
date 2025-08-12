import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { ContractPerformanceController } from './controllers/contract-performance.controller';
import { ContractAdherenceService } from './services/contract-adherence.service';
import { MasterContract } from './entities/master-contract.entity';
import { ContractProductSLA } from './entities/contract-product-sla.entity';
import { ContractPerformanceMetric } from './entities/contract-performance-metric.entity';
import { Product } from '@modules/products/entities/product.entity';
import { Supplier } from '@modules/suppliers/entities/supplier.entity';
import { PurchaseOrder } from '@modules/orders/entities/purchase-order.entity';
import { PurchaseOrderProduct } from '@modules/orders/entities/purchase-order-product.entity';
import { PaginationService } from '@common/services/pagination.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MasterContract,
      ContractProductSLA,
      ContractPerformanceMetric,
      Product,
      Supplier,
      PurchaseOrder,
      PurchaseOrderProduct,
    ]),
  ],
  controllers: [ContractsController, ContractPerformanceController],
  providers: [ContractsService, ContractAdherenceService, PaginationService],
  exports: [ContractsService, ContractAdherenceService],
})
export class ContractsModule {}