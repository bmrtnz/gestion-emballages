import { IsUUID, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStockStationDto {
  @ApiProperty({ description: 'Station ID' })
  @IsUUID()
  stationId: string;

  @ApiProperty({ description: 'Article ID' })
  @IsUUID()
  articleId: string;

  @ApiProperty({ description: 'Quantité actuelle', minimum: 0 })
  @IsNumber()
  @Min(0)
  quantiteActuelle: number;

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