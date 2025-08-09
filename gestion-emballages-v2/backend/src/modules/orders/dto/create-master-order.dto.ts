import { IsString, IsUUID, IsEnum, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@common/enums/order-status.enum';
import { CreateOrderDto } from './create-order.dto';

export class CreateMasterOrderDto {
  @ApiProperty({ description: 'Station ID' })
  @IsUUID()
  stationId: string;

  @ApiPropertyOptional({ 
    description: 'General status of the master order',
    enum: OrderStatus,
    default: OrderStatus.ENREGISTREE
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  generalStatus?: OrderStatus;

  @ApiProperty({ 
    description: 'Individual orders',
    type: [CreateOrderDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDto)
  orders: Omit<CreateOrderDto, 'stationId'>[];
}