import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCommandeDto, CreateCommandeArticleDto } from './create-commande.dto';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@common/enums/order-status.enum';

export class UpdateCommandeArticleDto extends PartialType(CreateCommandeArticleDto) {}

export class UpdateCommandeDto extends PartialType(
  OmitType(CreateCommandeDto, ['stationId', 'fournisseurId'] as const)
) {
  @ApiPropertyOptional({ 
    description: 'Statut de la commande',
    enum: OrderStatus
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  statut?: OrderStatus;

  @ApiPropertyOptional({ description: 'Date de livraison prévue' })
  @IsOptional()  
  @IsDateString()
  dateLivraisonPrevue?: string;

  @ApiPropertyOptional({ description: 'Date de livraison réelle' })
  @IsOptional()
  @IsDateString()
  dateLivraisonReelle?: string;
}