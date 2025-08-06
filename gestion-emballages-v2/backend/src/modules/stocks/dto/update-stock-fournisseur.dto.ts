import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateStockFournisseurDto } from './create-stock-fournisseur.dto';
import { IsNumber, Min, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStockFournisseurDto extends PartialType(
  OmitType(CreateStockFournisseurDto, ['fournisseurSiteId', 'articleId'] as const)
) {
  @ApiPropertyOptional({ description: 'Quantité disponible', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantiteDisponible?: number;
}