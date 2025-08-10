import { IsArray, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@common/enums/order-status.enum';
import { CreatePurchaseOrderDto } from './create-purchase-order.dto';

export class CreateMasterOrderDto {
  @ApiProperty({ description: 'Station ID' })
  @IsUUID()
  stationId: string;

  @ApiPropertyOptional({
    description: 'General status of the master order',
    enum: OrderStatus,
    default: OrderStatus.ENREGISTREE,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  generalStatus?: OrderStatus;

  @ApiProperty({
    description: 'Individual orders',
    type: [CreatePurchaseOrderDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderDto)
  purchaseOrders: Omit<CreatePurchaseOrderDto, 'stationId'>[];
}
