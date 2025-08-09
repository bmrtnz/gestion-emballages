import { IsString, IsOptional, IsDateString, IsNumber, IsArray, ValidateNested, IsNotEmpty, Min, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateSalesOrderProductDto {
  @IsString({ message: 'productId doit être une chaîne de caractères' })
  productId: string;

  @IsNumber({}, { message: 'lineNumber doit être un nombre' })
  @Min(1, { message: 'Le numéro de ligne doit être au moins 1' })
  lineNumber: number;

  @IsNumber({}, { message: 'quantity doit être un nombre' })
  @Min(1, { message: 'La quantité doit être au moins 1' })
  quantity: number;

  @IsNumber({}, { message: 'unitPrice doit être un nombre' })
  @Min(0, { message: 'Le prix unitaire doit être positif' })
  unitPrice: number;

  @IsOptional()
  @IsNumber({}, { message: 'discountPercent doit être un nombre' })
  @Min(0, { message: 'Le pourcentage de remise doit être positif' })
  discountPercent?: number;

  @IsOptional()
  @IsNumber({}, { message: 'discountAmount doit être un nombre' })
  @Min(0, { message: 'Le montant de remise doit être positif' })
  discountAmount?: number;

  @IsOptional()
  @IsNumber({}, { message: 'taxRate doit être un nombre' })
  @Min(0, { message: 'Le taux de taxe doit être positif' })
  taxRate?: number; // Defaults to 20%

  @IsOptional()
  @IsString({ message: 'stockLocation doit être une chaîne de caractères' })
  stockLocation?: string;

  @IsOptional()
  @IsString({ message: 'batchNumber doit être une chaîne de caractères' })
  batchNumber?: string;

  @IsOptional()
  @IsDateString({}, { message: 'expiryDate doit être une date valide' })
  expiryDate?: string;

  @IsOptional()
  @IsString({ message: 'notes doit être une chaîne de caractères' })
  @Transform(({ value }) => value?.trim())
  notes?: string;
}

export class CreateSalesOrderDto {
  @IsOptional()
  @IsString({ message: 'soNumber doit être une chaîne de caractères' })
  soNumber?: string; // Generated if not provided

  @IsString({ message: 'customerStationId est obligatoire' })
  customerStationId: string;

  @IsString({ message: 'customerPoNumber est obligatoire' })
  customerPoNumber: string; // Reference to customer's PO

  @IsString({ message: 'fulfillmentPlatformId est obligatoire' })
  fulfillmentPlatformId: string;

  @IsString({ message: 'deliveryAddress est obligatoire' })
  @Transform(({ value }) => value?.trim())
  deliveryAddress: string;

  @IsOptional()
  @IsDateString({}, { message: 'orderDate doit être une date valide' })
  orderDate?: string; // Defaults to current date

  @IsOptional()
  @IsDateString({}, { message: 'promisedDeliveryDate doit être une date valide' })
  promisedDeliveryDate?: string;

  @IsOptional()
  @IsNumber({}, { message: 'platformFees doit être un nombre' })
  @Min(0, { message: 'Les frais de plateforme doivent être positifs' })
  platformFees?: number; // Defaults to 0

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

  @IsOptional()
  @IsString({ message: 'carrierName doit être une chaîne de caractères' })
  @Transform(({ value }) => value?.trim())
  carrierName?: string;

  @IsArray({ message: 'salesOrderProducts doit être un tableau' })
  @ValidateNested({ each: true })
  @Type(() => CreateSalesOrderProductDto)
  salesOrderProducts: CreateSalesOrderProductDto[];
}