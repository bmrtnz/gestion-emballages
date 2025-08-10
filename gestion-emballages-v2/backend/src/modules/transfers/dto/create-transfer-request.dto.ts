import { IsArray, IsEnum, IsNumber, IsOptional, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransferStatus } from '@common/enums/transfer-status.enum';

export class CreateDemandeTransfertArticleDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  articleId: string;

  @ApiProperty({ description: 'Quantité demandée', minimum: 1 })
  @IsNumber()
  @Min(1)
  requestedQuantity: number;

  @ApiPropertyOptional({ description: 'Quantité accordée', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantiteAccordee?: number;

  @ApiPropertyOptional({ description: 'Quantité livrée', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveredQuantity?: number;
}

export class CreateTransferRequestDto {
  @ApiProperty({ description: 'Station demandeuse ID' })
  @IsUUID()
  requestingStationId: string;

  @ApiProperty({ description: 'Station source ID' })
  @IsUUID()
  sourceStationId: string;

  @ApiPropertyOptional({
    description: 'Statut de la demande',
    enum: TransferStatus,
    default: TransferStatus.ENREGISTREE,
  })
  @IsOptional()
  @IsEnum(TransferStatus)
  status?: TransferStatus;

  @ApiProperty({
    description: 'Articles de la demande de transfert',
    type: [CreateDemandeTransfertArticleDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDemandeTransfertArticleDto)
  articles: CreateDemandeTransfertArticleDto[];
}
