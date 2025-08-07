import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StationsController } from './stations.controller';
import { StationsService } from './stations.service';
import { Station } from './entities/station.entity';
import { StationGroup } from './entities/station-group.entity';
import { StationContact } from './entities/station-contact.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Station, StationGroup, StationContact])],
  controllers: [StationsController],
  providers: [StationsService],
  exports: [StationsService, TypeOrmModule],
})
export class StationsModule {}