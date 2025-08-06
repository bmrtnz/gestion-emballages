import { IsString, IsUUID, IsEnum, IsOptional, IsArray, ValidateNested, IsNumber, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@common/enums/order-status.enum';

export class CreateCommandeArticleDto {
  @ApiProperty({ description: 'Article ID' })
  @IsUUID()
  articleId: string;

  @ApiProperty({ description: 'Article fournisseur ID' })
  @IsUUID()
  articleFournisseurId: string;

  @ApiProperty({ description: 'Quantité commandée', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantiteCommandee: number;

  @ApiProperty({ description: 'Prix unitaire' })
  @IsNumber()
  @Min(0)
  prixUnitaire: number;

  @ApiPropertyOptional({ description: 'Unité de conditionnement' })
  @IsOptional()
  @IsString()
  uniteConditionnement?: string;

  @ApiPropertyOptional({ description: 'Quantité par conditionnement' })
  @IsOptional()
  @IsNumber()
  quantiteParConditionnement?: number;

  @ApiPropertyOptional({ description: 'Référence fournisseur' })
  @IsOptional()
  @IsString()
  referenceFournisseur?: string;

  @ApiPropertyOptional({ description: 'Date souhaitée de livraison' })
  @IsOptional()
  @IsDateString()
  dateSouhaitee_livraison?: string;
}

export class CreateCommandeDto {
  @ApiPropertyOptional({ description: 'ID de la commande globale' })
  @IsOptional()
  @IsUUID()
  commandeGlobaleId?: string;

  @ApiProperty({ description: 'Station ID' })
  @IsUUID()
  stationId: string;

  @ApiProperty({ description: 'Fournisseur ID' })
  @IsUUID()
  fournisseurId: string;

  @ApiPropertyOptional({ 
    description: 'Statut de la commande',
    enum: OrderStatus,
    default: OrderStatus.ENREGISTREE
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  statut?: OrderStatus;

  @ApiPropertyOptional({ description: 'Date de livraison prévue' })
  @IsOptional()
  @IsDateString()
  dateLivraisonPrevue?: string;

  @ApiProperty({ 
    description: 'Articles de la commande',
    type: [CreateCommandeArticleDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCommandeArticleDto)
  commandeArticles: CreateCommandeArticleDto[];
}