import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateStationContactDto } from './create-station-contact.dto';

export class UpdateStationContactDto extends PartialType(OmitType(CreateStationContactDto, ['stationId'] as const)) {}
