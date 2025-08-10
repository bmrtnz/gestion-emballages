import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsOptional, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateShoppingCartDto, CreateShoppingCartItemDto } from './create-shopping-cart.dto';

export class UpdateShoppingCartItemDto {
  @ApiPropertyOptional({ description: "ID de l'item (pour les mises à jour)" })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional({ description: 'Product ID' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ description: 'Supplier ID' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ description: 'Quantité demandée', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Date souhaitée de livraison' })
  @IsOptional()
  @IsDateString()
  desiredDeliveryDate?: string;
}

export class UpdateShoppingCartDto {
  @ApiPropertyOptional({ description: 'Station ID' })
  @IsOptional()
  @IsUUID()
  stationId?: string;

  @ApiPropertyOptional({ description: 'Statut de la liste' })
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Notes sur la liste' })
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Articles de la liste (remplace tous les items existants)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateShoppingCartItemDto)
  items?: UpdateShoppingCartItemDto[];
}

export class AddItemToShoppingCartDto {
  @ApiPropertyOptional({ description: 'Product ID' })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({ description: 'Supplier ID' })
  @IsUUID()
  supplierId: string;

  @ApiPropertyOptional({ description: 'Quantité' })
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Date souhaitée de livraison' })
  @IsOptional()
  desiredDeliveryDate?: string;
}

export class ValidateShoppingCartDto {
  @ApiPropertyOptional({ description: 'Notes de validation' })
  @IsOptional()
  notes?: string;
}
