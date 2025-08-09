import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateStockSupplierDto } from './create-stock-Supplier.dto';
import { IsNumber, Min, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStockSupplierDto extends PartialType(
  OmitType(CreateStockSupplierDto, ['fournisseurSiteId', 'articleId'] as const)
) {
  @ApiPropertyOptional({ description: 'Quantité disponible', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantiteDisponible?: number;
}