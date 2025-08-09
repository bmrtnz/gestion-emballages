import { IsString, IsOptional, IsArray, IsNotEmpty, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePlatformDto {
  @IsNotEmpty({ message: 'Le name est obligatoire' })
  @IsString({ message: 'Le name doit être une chaîne de caractères' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsOptional()
  @IsString({ message: 'Le type doit être une chaîne de caractères' })
  @Transform(({ value }) => value?.trim())
  type?: string;

  @IsOptional()
  @IsArray({ message: 'Les spécialités doivent être un tableau' })
  @IsString({ each: true, message: 'Chaque spécialité doit être une chaîne de caractères' })
  specialties?: string[];

  @IsOptional()
  @IsBoolean({ message: 'isActive doit être un booléen' })
  isActive?: boolean;
}