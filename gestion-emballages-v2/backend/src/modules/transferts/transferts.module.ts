import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransfertsService } from './transferts.service';
import { TransfertsController } from './transferts.controller';
import { DemandeTransfert } from './entities/demande-transfert.entity';
import { DemandeTransfertArticle } from './entities/demande-transfert-article.entity';
import { PaginationService } from '@common/services/pagination.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DemandeTransfert,
      DemandeTransfertArticle
    ])
  ],
  controllers: [TransfertsController],
  providers: [TransfertsService, PaginationService],
  exports: [TransfertsService]
})
export class TransfertsModule {}