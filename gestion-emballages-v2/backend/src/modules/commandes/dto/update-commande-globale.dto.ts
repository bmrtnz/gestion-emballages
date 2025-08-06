import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCommandeGlobaleDto } from './create-commande-globale.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@common/enums/order-status.enum';

export class UpdateCommandeGlobaleDto extends PartialType(
  OmitType(CreateCommandeGlobaleDto, ['stationId', 'commandes'] as const)
) {
  @ApiPropertyOptional({ 
    description: 'Statut général de la commande globale',
    enum: OrderStatus
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  statutGeneral?: OrderStatus;
}