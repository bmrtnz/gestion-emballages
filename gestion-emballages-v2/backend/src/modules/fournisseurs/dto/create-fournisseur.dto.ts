import { IsString, IsOptional, IsArray, Length } from 'class-validator';

export class CreateFournisseurDto {
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  @Length(14, 14)
  siret?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialites?: string[];
}