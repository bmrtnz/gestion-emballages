import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FournisseursController } from './fournisseurs.controller';
import { FournisseursService } from './fournisseurs.service';
import { Fournisseur } from './entities/fournisseur.entity';
import { FournisseurSite } from './entities/fournisseur-site.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Fournisseur, FournisseurSite])],
  controllers: [FournisseursController],
  providers: [FournisseursService],
  exports: [FournisseursService, TypeOrmModule],
})
export class FournisseursModule {}