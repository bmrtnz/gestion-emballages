import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsArray, ValidateNested, IsUUID, IsInt, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateListeAchatDto, CreateListeAchatItemDto } from './create-liste-achat.dto';

export class UpdateListeAchatItemDto {
  @ApiPropertyOptional({ description: 'ID de l\'item (pour les mises à jour)' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional({ description: 'Article ID' })
  @IsOptional()
  @IsUUID()
  articleId?: string;

  @ApiPropertyOptional({ description: 'Fournisseur ID' })
  @IsOptional()
  @IsUUID()
  fournisseurId?: string;

  @ApiPropertyOptional({ description: 'Quantité demandée', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantite?: number;

  @ApiPropertyOptional({ description: 'Date souhaitée de livraison' })
  @IsOptional()
  @IsDateString()
  dateSouhaitee_livraison?: string;
}

export class UpdateListeAchatDto {
  @ApiPropertyOptional({ description: 'Station ID' })
  @IsOptional()
  @IsUUID()
  stationId?: string;

  @ApiPropertyOptional({ description: 'Statut de la liste' })
  @IsOptional()
  statut?: string;

  @ApiPropertyOptional({ description: 'Notes sur la liste' })
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Articles de la liste (remplace tous les items existants)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateListeAchatItemDto)
  items?: UpdateListeAchatItemDto[];
}

export class AddItemToListeDto {
  @ApiPropertyOptional({ description: 'Article ID' })
  @IsUUID()
  articleId: string;

  @ApiPropertyOptional({ description: 'Fournisseur ID' })
  @IsUUID()
  fournisseurId: string;

  @ApiPropertyOptional({ description: 'Quantité' })
  @IsOptional()
  quantite?: number;

  @ApiPropertyOptional({ description: 'Date souhaitée de livraison' })
  @IsOptional()
  dateSouhaitee_livraison?: string;
}

export class ValidateListeAchatDto {
  @ApiPropertyOptional({ description: 'Notes de validation' })
  @IsOptional()
  notes?: string;
}