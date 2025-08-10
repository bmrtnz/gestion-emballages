import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StationsController } from './stations.controller';
import { StationsService } from './stations.service';
import { StationGroupsController } from './station-groups.controller';
import { StationGroupsService } from './station-groups.service';
import { StationContactsController } from './station-contacts.controller';
import { StationContactsService } from './station-contacts.service';
import { Station } from './entities/station.entity';
import { StationGroup } from './entities/station-group.entity';
import { StationContact } from './entities/station-contact.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Station, StationGroup, StationContact])],
  controllers: [StationsController, StationGroupsController, StationContactsController],
  providers: [StationsService, StationGroupsService, StationContactsService],
  exports: [StationsService, StationGroupsService, StationContactsService, TypeOrmModule],
})
export class StationsModule {}
