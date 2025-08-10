import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ConditioningUnit } from '@common/enums/conditioning-unit.enum';

export class CreateProductSupplierDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  supplierId: string;

  @IsOptional()
  @IsString()
  supplierProductCode?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  conditioningPrice: number;

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
  indicativeSupplyDelay?: number; // in working days

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
