import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateDemandeTransfertArticleDto, CreateTransferRequestDto } from './create-transfer-request.dto';
import { IsArray, IsEnum, IsNumber, IsOptional, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransferStatus } from '@common/enums/transfer-status.enum';

export class UpdateTransferRequestProductDto {
  @ApiPropertyOptional({ description: 'Transfer product ID (for updates)' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional({ description: 'Product ID' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ description: 'Quantité demandée', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  requestedQuantity?: number;

  @ApiPropertyOptional({ description: 'Quantité accordée', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  grantedQuantity?: number;

  @ApiPropertyOptional({ description: 'Quantité livrée', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveredQuantity?: number;
}

export class UpdateTransferRequestDto {
  @ApiPropertyOptional({ description: 'Station source ID' })
  @IsOptional()
  @IsUUID()
  sourceStationId?: string;

  @ApiPropertyOptional({
    description: 'Statut de la demande',
    enum: TransferStatus,
  })
  @IsOptional()
  @IsEnum(TransferStatus)
  status?: TransferStatus;

  @ApiPropertyOptional({ description: 'Expected shipping date' })
  @IsOptional()
  expectedShippingDate?: string;

  @ApiPropertyOptional({ description: 'Actual shipping date' })
  @IsOptional()
  actualShippingDate?: string;

  @ApiPropertyOptional({ description: 'Actual reception date' })
  @IsOptional()
  actualReceptionDate?: string;

  @ApiPropertyOptional({ description: 'Tracking number' })
  @IsOptional()
  trackingNumber?: string;

  @ApiPropertyOptional({ description: 'Rejection reason' })
  @IsOptional()
  rejectionReason?: string;

  @ApiPropertyOptional({ description: 'Notes sur la demande' })
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Articles de la demande de transfert',
    type: [UpdateTransferRequestProductDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTransferRequestProductDto)
  products?: UpdateTransferRequestProductDto[];
}

export class ApproveTransferDto {
  @ApiPropertyOptional({
    description: 'Articles approuvés avec quantités accordées',
    type: [UpdateTransferRequestProductDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTransferRequestProductDto)
  products: UpdateTransferRequestProductDto[];
}
