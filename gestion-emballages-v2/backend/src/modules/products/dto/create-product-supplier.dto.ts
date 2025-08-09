import { IsString, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateProductSupplierDto {
  @IsUUID()
  articleId: string;

  @IsUUID()
  supplierId: string;

  @IsOptional()
  @IsString()
  referenceFournisseur?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice: number;

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