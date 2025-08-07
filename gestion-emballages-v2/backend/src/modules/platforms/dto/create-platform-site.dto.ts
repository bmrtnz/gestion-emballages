import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePlatformSiteDto {
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @Transform(({ value }) => value?.trim())
  nom: string;

  @IsOptional()
  @IsString({ message: 'L\'adresse doit être une chaîne de caractères' })
  @Transform(({ value }) => value?.trim())
  adresse?: string;

  @IsOptional()
  @IsString({ message: 'La ville doit être une chaîne de caractères' })
  @Transform(({ value }) => value?.trim())
  ville?: string;

  @IsOptional()
  @IsString({ message: 'Le code postal doit être une chaîne de caractères' })
  @Transform(({ value }) => value?.trim())
  codePostal?: string;

  @IsOptional()
  @IsString({ message: 'Le téléphone doit être une chaîne de caractères' })
  @Transform(({ value }) => value?.trim())
  telephone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'L\'email doit être valide' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @IsOptional()
  @IsBoolean({ message: 'isPrincipal doit être un booléen' })
  isPrincipal?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isActive doit être un booléen' })
  isActive?: boolean;
}