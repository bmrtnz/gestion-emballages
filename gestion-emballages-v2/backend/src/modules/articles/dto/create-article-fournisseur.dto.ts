import { IsString, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateArticleFournisseurDto {
  @IsUUID()
  articleId: string;

  @IsUUID()
  fournisseurId: string;

  @IsOptional()
  @IsString()
  referenceFournisseur?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  prixUnitaire: number;

  @IsOptional()
  @IsString()
  uniteConditionnement?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantiteParConditionnement?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  delaiIndicatifApprovisionnement?: number; // in working days

  @IsOptional()
  @IsString()
  imageUrl?: string;
}