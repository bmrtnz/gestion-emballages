import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateOrderDto, CreateCommandeArticleDto } from './create-Order.dto';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@common/enums/order-status.enum';

export class UpdateCommandeArticleDto extends PartialType(CreateCommandeArticleDto) {}

export class UpdateOrderDto extends PartialType(
  OmitType(CreateOrderDto, ['stationId', 'supplierId'] as const)
) {
  @ApiPropertyOptional({ 
    description: 'Statut de la Order',
    enum: OrderStatus
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ description: 'Date de livraison prévue' })
  @IsOptional()  
  @IsDateString()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional({ description: 'Date de livraison réelle' })
  @IsOptional()
  @IsDateString()
  actualDeliveryDate?: string;
}