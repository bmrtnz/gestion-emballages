import { PartialType } from '@nestjs/mapped-types';
import { CreateSalesOrderDto } from './create-sales-order.dto';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { OrderStatus } from '@common/enums/order-status.enum';

export class UpdateSalesOrderDto extends PartialType(CreateSalesOrderDto) {
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'status doit être une valeur valide du statut de commande' })
  status?: OrderStatus;

  @IsOptional()
  @IsDateString({}, { message: 'actualShipDate doit être une date valide' })
  actualShipDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'actualDeliveryDate doit être une date valide' })
  actualDeliveryDate?: string;

  @IsOptional()
  @IsString({ message: 'invoiceNumber doit être une chaîne de caractères' })
  invoiceNumber?: string;

  @IsOptional()
  @IsDateString({}, { message: 'invoiceDate doit être une date valide' })
  invoiceDate?: string;

  @IsOptional()
  @IsEnum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'], {
    message: 'invoiceStatus doit être une valeur valide',
  })
  invoiceStatus?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

  @IsOptional()
  @IsDateString({}, { message: 'paymentDueDate doit être une date valide' })
  paymentDueDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'paymentReceivedDate doit être une date valide' })
  paymentReceivedDate?: string;

  @IsOptional()
  @IsString({ message: 'pickingListNumber doit être une chaîne de caractères' })
  pickingListNumber?: string;

  @IsOptional()
  @IsString({ message: 'shippingTrackingNumber doit être une chaîne de caractères' })
  shippingTrackingNumber?: string;

  @IsOptional()
  @IsNumber({}, { message: 'taxAmount doit être un nombre' })
  @Min(0, { message: 'Le montant de taxe doit être positif' })
  taxAmount?: number;

  @IsOptional()
  @IsDateString({}, { message: 'fulfilledAt doit être une date valide' })
  fulfilledAt?: string;
}
