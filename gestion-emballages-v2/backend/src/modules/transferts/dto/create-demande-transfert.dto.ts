import { IsString, IsUUID, IsEnum, IsOptional, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransferStatus } from '@common/enums/transfer-status.enum';

export class CreateDemandeTransfertArticleDto {
  @ApiProperty({ description: 'Article ID' })
  @IsUUID()
  articleId: string;

  @ApiProperty({ description: 'Quantité demandée', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantiteDemandee: number;

  @ApiPropertyOptional({ description: 'Quantité accordée', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantiteAccordee?: number;

  @ApiPropertyOptional({ description: 'Quantité livrée', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantiteLivree?: number;
}

export class CreateDemandeTransfertDto {
  @ApiProperty({ description: 'Station demandeuse ID' })
  @IsUUID()
  stationDemandeuseId: string;

  @ApiProperty({ description: 'Station source ID' })
  @IsUUID()
  stationSourceId: string;

  @ApiPropertyOptional({ 
    description: 'Statut de la demande',
    enum: TransferStatus,
    default: TransferStatus.ENREGISTREE
  })
  @IsOptional()
  @IsEnum(TransferStatus)
  statut?: TransferStatus;

  @ApiProperty({ 
    description: 'Articles de la demande de transfert',
    type: [CreateDemandeTransfertArticleDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDemandeTransfertArticleDto)
  articles: CreateDemandeTransfertArticleDto[];
}