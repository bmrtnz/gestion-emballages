import { IsString, IsUUID, IsEnum, IsOptional, IsArray, ValidateNested, IsNumber, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@common/enums/order-status.enum';

export class CreateCommandeArticleDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  articleId: string;

  @ApiProperty({ description: 'Product Supplier ID' })
  @IsUUID()
  articlesupplierId: string;

  @ApiProperty({ description: 'Quantité commandée', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantiteCommandee: number;

  @ApiProperty({ description: 'Prix unitaire' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Unité de conditionnement' })
  @IsOptional()
  @IsString()
  uniteConditionnement?: string;

  @ApiPropertyOptional({ description: 'Quantité par conditionnement' })
  @IsOptional()
  @IsNumber()
  quantiteParConditionnement?: number;

  @ApiPropertyOptional({ description: 'Référence Supplier' })
  @IsOptional()
  @IsString()
  referenceFournisseur?: string;

  @ApiPropertyOptional({ description: 'Date souhaitée de livraison' })
  @IsOptional()
  @IsDateString()
  dateSouhaitee_livraison?: string;
}

export class CreateOrderDto {
  @ApiPropertyOptional({ description: 'ID de la Order globale' })
  @IsOptional()
  @IsUUID()
  globalOrderId?: string;

  @ApiProperty({ description: 'Station ID' })
  @IsUUID()
  stationId: string;

  @ApiProperty({ description: 'Supplier ID' })
  @IsUUID()
  supplierId: string;

  @ApiPropertyOptional({ 
    description: 'Statut de la Order',
    enum: OrderStatus,
    default: OrderStatus.ENREGISTREE
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ description: 'Date de livraison prévue' })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @ApiProperty({ 
    description: 'Articles de la Order',
    type: [CreateCommandeArticleDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCommandeArticleDto)
  commandeArticles: CreateCommandeArticleDto[];
}