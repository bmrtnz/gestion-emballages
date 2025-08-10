import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateProductSupplierDto } from './create-product-supplier.dto';
import { ConditioningUnit } from '@common/enums/conditioning-unit.enum';

export class UpdateProductSupplierDto extends PartialType(
  OmitType(CreateProductSupplierDto, ['productId', 'supplierId'] as const)
) {
  @IsOptional()
  @IsString()
  supplierProductCode?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  conditioningPrice?: number;

  @IsOptional()
  @IsEnum(ConditioningUnit)
  conditioningUnit?: ConditioningUnit;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantityPerConditioning?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  indicativeSupplyDelay?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
