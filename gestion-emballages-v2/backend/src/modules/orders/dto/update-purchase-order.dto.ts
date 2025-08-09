import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchaseOrderDto } from './create-purchase-order.dto';
import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { OrderStatus } from '@common/enums/order-status.enum';

export class UpdatePurchaseOrderDto extends PartialType(CreatePurchaseOrderDto) {
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'status doit être une valeur valide du statut de commande' })
  status?: OrderStatus;

  @IsOptional()
  @IsDateString({}, { message: 'confirmedDeliveryDate doit être une date valide' })
  confirmedDeliveryDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'actualDeliveryDate doit être une date valide' })
  actualDeliveryDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'approvedAt doit être une date valide' })
  approvedAt?: string;
}