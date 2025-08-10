import { PartialType } from '@nestjs/mapped-types';
import { CreateStationGroupDto } from './create-station-group.dto';

export class UpdateStationGroupDto extends PartialType(CreateStationGroupDto) {}
