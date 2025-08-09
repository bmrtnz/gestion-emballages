import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransfersService } from './transfers.service';
import { TransfersController } from './transfers.controller';
import { TransferRequest } from './entities/transfer-request.entity';
import { TransferRequestProduct } from './entities/transfer-request-product.entity';
import { PaginationService } from '@common/services/pagination.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransferRequest,
      TransferRequestProduct
    ])
  ],
  controllers: [TransfersController],
  providers: [TransfersService, PaginationService],
  exports: [TransfersService]
})
export class TransfersModule {}