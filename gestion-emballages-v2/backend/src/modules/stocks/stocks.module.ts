import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { StockStation } from './entities/stock-station.entity';
import { StockFournisseur } from './entities/stock-fournisseur.entity';
import { PaginationService } from '@common/services/pagination.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StockStation,
      StockFournisseur
    ])
  ],
  controllers: [StocksController],
  providers: [StocksService, PaginationService],
  exports: [StocksService]
})
export class StocksModule {}