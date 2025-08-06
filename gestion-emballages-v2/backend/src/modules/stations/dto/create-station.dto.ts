import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AdresseDto {
  @IsOptional()
  @IsString()
  rue?: string;

  @IsOptional()
  @IsString()
  codePostal?: string;

  @IsOptional()
  @IsString()
  ville?: string;

  @IsOptional()
  @IsString()
  pays?: string;
}

class ContactPrincipalDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  email?: string;
}

export class CreateStationDto {
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  identifiantInterne?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdresseDto)
  adresse?: AdresseDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ContactPrincipalDto)
  contactPrincipal?: ContactPrincipalDto;
}