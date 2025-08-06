import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { Article } from './entities/article.entity';
import { ArticleFournisseur } from './entities/article-fournisseur.entity';
import { Fournisseur } from '@modules/fournisseurs/entities/fournisseur.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, ArticleFournisseur, Fournisseur])
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}