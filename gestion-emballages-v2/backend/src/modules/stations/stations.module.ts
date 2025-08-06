import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StationsController } from './stations.controller';
import { StationsService } from './stations.service';
import { Station } from './entities/station.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Station])],
  controllers: [StationsController],
  providers: [StationsService],
  exports: [StationsService, TypeOrmModule],
})
export class StationsModule {}