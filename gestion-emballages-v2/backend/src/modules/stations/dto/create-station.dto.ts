import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AdresseDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

class ContactPrincipalDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;
}

export class CreateStationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  internalId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdresseDto)
  address?: AdresseDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ContactPrincipalDto)
  mainContact?: ContactPrincipalDto;
}