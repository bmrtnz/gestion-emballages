import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommandesService } from './commandes.service';
import { CommandesController } from './commandes.controller';
import { Commande } from './entities/commande.entity';
import { CommandeGlobale } from './entities/commande-globale.entity';
import { CommandeArticle } from './entities/commande-article.entity';
import { PaginationService } from '@common/services/pagination.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Commande,
      CommandeGlobale,
      CommandeArticle
    ])
  ],
  controllers: [CommandesController],
  providers: [CommandesService, PaginationService],
  exports: [CommandesService]
})
export class CommandesModule {}