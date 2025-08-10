import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreatePurchaseOrderProductDto {
  @IsString({ message: 'productId doit être une chaîne de caractères' })
  productId: string;

  @IsString({ message: 'productSupplierId doit être une chaîne de caractères' })
  productSupplierId: string;

  @IsNumber({}, { message: 'quantity doit être un nombre' })
  @Min(1, { message: 'La quantité doit être au moins 1' })
  quantity: number;

  @IsNumber({}, { message: 'unitPrice doit être un nombre' })
  @Min(0, { message: 'Le prix unitaire doit être positif' })
  unitPrice: number;

  @IsOptional()
  @IsString({ message: 'packagingUnit doit être une chaîne de caractères' })
  packagingUnit?: string;

  @IsOptional()
  @IsNumber({}, { message: 'quantityPerPackage doit être un nombre' })
  quantityPerPackage?: number;

  @IsOptional()
  @IsString({ message: 'supplierReference doit être une chaîne de caractères' })
  supplierReference?: string;

  @IsOptional()
  @IsDateString({}, { message: 'desiredDeliveryDate doit être une date valide' })
  desiredDeliveryDate?: string;
}

export class CreatePurchaseOrderDto {
  @IsOptional()
  @IsString({ message: 'poNumber doit être une chaîne de caractères' })
  poNumber?: string; // Generated if not provided

  @IsOptional()
  @IsString({ message: 'masterOrderId doit être une chaîne de caractères' })
  masterOrderId?: string;

  @IsEnum(['BLUE_WHALE', 'STATION'], { message: 'buyerType doit être BLUE_WHALE ou STATION' })
  buyerType: 'BLUE_WHALE' | 'STATION';

  @IsOptional()
  @IsString({ message: 'stationId doit être une chaîne de caractères' })
  stationId?: string; // Required when buyerType is STATION

  @IsOptional()
  @IsString({ message: 'supplierId doit être une chaîne de caractères' })
  supplierId?: string; // Required when buying from external supplier

  @IsBoolean({ message: 'isInternalSupplier doit être un booléen' })
  isInternalSupplier: boolean; // true when buying from Blue Whale

  @IsEnum(['PLATFORM', 'STATION', 'OTHER'], { message: 'deliveryLocationType doit être PLATFORM, STATION ou OTHER' })
  deliveryLocationType: 'PLATFORM' | 'STATION' | 'OTHER';

  @IsOptional()
  @IsString({ message: 'platformId doit être une chaîne de caractères' })
  platformId?: string;

  @IsOptional()
  @IsString({ message: 'deliveryStationId doit être une chaîne de caractères' })
  deliveryStationId?: string;

  @IsOptional()
  @IsString({ message: 'deliveryAddress doit être une chaîne de caractères' })
  @Transform(({ value }) => value?.trim())
  deliveryAddress?: string;

  @IsOptional()
  @IsDateString({}, { message: 'orderDate doit être une date valide' })
  orderDate?: string; // Defaults to current date

  @IsOptional()
  @IsDateString({}, { message: 'requestedDeliveryDate doit être une date valide' })
  requestedDeliveryDate?: string;

  @IsOptional()
  @IsString({ message: 'currency doit être une chaîne de caractères' })
  currency?: string; // Defaults to EUR

  @IsOptional()
  @IsString({ message: 'notes doit être une chaîne de caractères' })
  @Transform(({ value }) => value?.trim())
  notes?: string;

  @IsOptional()
  @IsString({ message: 'paymentTerms doit être une chaîne de caractères' })
  @Transform(({ value }) => value?.trim())
  paymentTerms?: string;

  @IsArray({ message: 'orderProducts doit être un tableau' })
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderProductDto)
  orderProducts: CreatePurchaseOrderProductDto[];
}
