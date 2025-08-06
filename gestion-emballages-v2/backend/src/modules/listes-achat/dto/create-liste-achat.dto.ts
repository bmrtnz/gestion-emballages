import { IsString, IsOptional, IsUUID, IsArray, ValidateNested, IsInt, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateListeAchatItemDto {
  @ApiProperty({ description: 'Article ID' })
  @IsUUID()
  articleId: string;

  @ApiProperty({ description: 'Fournisseur ID' })
  @IsUUID()
  fournisseurId: string;

  @ApiProperty({ description: 'Quantité demandée', minimum: 1 })
  @IsInt()
  @Min(1)
  quantite: number;

  @ApiPropertyOptional({ description: 'Date souhaitée de livraison' })
  @IsOptional()
  @IsDateString()
  dateSouhaitee_livraison?: string;
}

export class CreateListeAchatDto {
  @ApiProperty({ description: 'Station ID' })
  @IsUUID()
  stationId: string;

  @ApiPropertyOptional({ description: 'Statut de la liste', default: 'active' })
  @IsOptional()
  @IsString()
  statut?: string;

  @ApiPropertyOptional({ description: 'Articles de la liste' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateListeAchatItemDto)
  items?: CreateListeAchatItemDto[];
}