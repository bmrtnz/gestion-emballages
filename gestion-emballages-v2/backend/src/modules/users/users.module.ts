import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Station } from '@modules/stations/entities/station.entity';
import { Fournisseur } from '@modules/fournisseurs/entities/fournisseur.entity';
import { DataIntegrityService } from '@common/services/data-integrity.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Station, Fournisseur])],
  controllers: [UsersController],
  providers: [UsersService, DataIntegrityService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}