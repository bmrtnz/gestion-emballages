import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePurchaseOrderProductDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Product Supplier ID' })
  @IsUUID()
  productSupplierId: string;

  @ApiProperty({ description: 'Ordered quantity', minimum: 1 })
  @IsNumber()
  @Min(1)
  orderedQuantity: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Packaging unit' })
  @IsOptional()
  @IsString()
  packagingUnit?: string;

  @ApiPropertyOptional({ description: 'Quantity per package' })
  @IsOptional()
  @IsNumber()
  quantityPerPackage?: number;

  @ApiPropertyOptional({ description: 'Supplier reference' })
  @IsOptional()
  @IsString()
  supplierReference?: string;

  @ApiPropertyOptional({ description: 'Desired delivery date' })
  @IsOptional()
  @IsDateString()
  desiredDeliveryDate?: string;
}
