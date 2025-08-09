import { IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStockSupplierDto {
  @ApiProperty({ description: 'Supplier site ID' })
  @IsUUID()
  fournisseurSiteId: string;

  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  articleId: string;

  @ApiProperty({ description: 'Quantité disponible', minimum: 0 })
  @IsNumber()
  @Min(0)
  quantiteDisponible: number;
}