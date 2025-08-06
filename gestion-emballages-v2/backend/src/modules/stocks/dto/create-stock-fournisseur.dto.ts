import { IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStockFournisseurDto {
  @ApiProperty({ description: 'Fournisseur site ID' })
  @IsUUID()
  fournisseurSiteId: string;

  @ApiProperty({ description: 'Article ID' })
  @IsUUID()
  articleId: string;

  @ApiProperty({ description: 'Quantité disponible', minimum: 0 })
  @IsNumber()
  @Min(0)
  quantiteDisponible: number;
}