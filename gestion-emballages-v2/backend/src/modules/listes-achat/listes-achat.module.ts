import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ListesAchatService } from './listes-achat.service';
import { ListesAchatController } from './listes-achat.controller';
import { ListeAchat } from './entities/liste-achat.entity';
import { ListeAchatItem } from './entities/liste-achat-item.entity';
import { PaginationService } from '@common/services/pagination.service';

// Import related entities for validation
import { Article } from '@modules/articles/entities/article.entity';
import { Fournisseur } from '@modules/fournisseurs/entities/fournisseur.entity';
import { Station } from '@modules/stations/entities/station.entity';
import { Commande } from '@modules/commandes/entities/commande.entity';
import { CommandeArticle } from '@modules/commandes/entities/commande-article.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ListeAchat,
      ListeAchatItem,
      Article,
      Fournisseur,
      Station,
      Commande,
      CommandeArticle
    ])
  ],
  controllers: [ListesAchatController],
  providers: [ListesAchatService, PaginationService],
  exports: [ListesAchatService]
})
export class ListesAchatModule {}