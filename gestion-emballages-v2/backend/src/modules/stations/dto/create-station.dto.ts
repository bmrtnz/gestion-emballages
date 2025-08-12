import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateStationDto {
  @IsOptional()
  @IsUUID()
  stationGroupId?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  address?: string | {
    street?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  coordinates?: {
    lat?: number;
    lng?: number;
  };
}
