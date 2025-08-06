import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateStockStationDto } from './create-stock-station.dto';
import { IsNumber, Min, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStockStationDto extends PartialType(
  OmitType(CreateStockStationDto, ['stationId', 'articleId'] as const)
) {
  @ApiPropertyOptional({ description: 'Quantité actuelle', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantiteActuelle?: number;

  @ApiPropertyOptional({ description: 'Seuil d\'alerte', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  seuilAlerte?: number;

  @ApiPropertyOptional({ description: 'Seuil critique', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  seuilCritique?: number;
}

export class AdjustStockDto {
  @ApiPropertyOptional({ description: 'Ajustement de quantité (peut être négatif)' })
  @IsNumber()
  ajustement: number;

  @ApiPropertyOptional({ description: 'Raison de l\'ajustement' })
  @IsOptional()
  raison?: string;
}