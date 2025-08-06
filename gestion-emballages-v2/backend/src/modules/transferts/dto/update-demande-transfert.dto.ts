import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateDemandeTransfertDto, CreateDemandeTransfertArticleDto } from './create-demande-transfert.dto';
import { IsEnum, IsOptional, IsArray, ValidateNested, IsNumber, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransferStatus } from '@common/enums/transfer-status.enum';

export class UpdateDemandeTransfertArticleDto {
  @ApiPropertyOptional({ description: 'ID de l\'article transfert (pour les mises à jour)' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional({ description: 'Article ID' })
  @IsOptional()
  @IsUUID()
  articleId?: string;

  @ApiPropertyOptional({ description: 'Quantité demandée', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantiteDemandee?: number;

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

export class UpdateDemandeTransfertDto {
  @ApiPropertyOptional({ description: 'Station source ID' })
  @IsOptional()
  @IsUUID()
  stationSourceId?: string;

  @ApiPropertyOptional({ 
    description: 'Statut de la demande',
    enum: TransferStatus
  })
  @IsOptional()
  @IsEnum(TransferStatus)
  statut?: TransferStatus;

  @ApiPropertyOptional({ description: 'Date prévue d\'expédition' })
  @IsOptional()
  dateExpeditionPrevue?: string;

  @ApiPropertyOptional({ description: 'Date réelle d\'expédition' })
  @IsOptional()
  dateExpeditionReelle?: string;

  @ApiPropertyOptional({ description: 'Date réelle de réception' })
  @IsOptional()
  dateReceptionReelle?: string;

  @ApiPropertyOptional({ description: 'Numéro de suivi' })
  @IsOptional()
  numeroSuivi?: string;

  @ApiPropertyOptional({ description: 'Raison du rejet' })
  @IsOptional()
  raisonRejet?: string;

  @ApiPropertyOptional({ description: 'Notes sur la demande' })
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ 
    description: 'Articles de la demande de transfert',
    type: [UpdateDemandeTransfertArticleDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateDemandeTransfertArticleDto)
  articles?: UpdateDemandeTransfertArticleDto[];
}

export class ApproveTransferDto {
  @ApiPropertyOptional({ 
    description: 'Articles approuvés avec quantités accordées',
    type: [UpdateDemandeTransfertArticleDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateDemandeTransfertArticleDto)
  articles: UpdateDemandeTransfertArticleDto[];
}