import { IsString, IsOptional, IsArray, IsNotEmpty, Length, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePlatformDto {
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @Transform(({ value }) => value?.trim())
  nom: string;

  @IsOptional()
  @IsString({ message: 'Le SIRET doit être une chaîne de caractères' })
  @Length(14, 14, { message: 'Le SIRET doit contenir exactement 14 caractères' })
  @Transform(({ value }) => value?.replace(/\s/g, ''))
  siret?: string;

  @IsOptional()
  @IsString({ message: 'Le type doit être une chaîne de caractères' })
  @Transform(({ value }) => value?.trim())
  type?: string;

  @IsOptional()
  @IsArray({ message: 'Les spécialités doivent être un tableau' })
  @IsString({ each: true, message: 'Chaque spécialité doit être une chaîne de caractères' })
  specialites?: string[];

  @IsOptional()
  @IsBoolean({ message: 'isActive doit être un booléen' })
  isActive?: boolean;
}