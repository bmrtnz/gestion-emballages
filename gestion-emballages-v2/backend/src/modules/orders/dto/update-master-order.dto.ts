import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateMasterOrderDto } from './create-master-order.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@common/enums/order-status.enum';

export class UpdateMasterOrderDto extends PartialType(
  OmitType(CreateMasterOrderDto, ['stationId', 'purchaseOrders'] as const)
) {
  @ApiPropertyOptional({
    description: 'General status of the master order',
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  statutGeneral?: OrderStatus;
}
