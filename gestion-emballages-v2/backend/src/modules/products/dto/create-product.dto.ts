import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ProductCategory } from '@common/enums/product-category.enum';

export class CreateProductDto {
  @IsString()
  @MaxLength(100)
  productCode: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsString()
  description: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;
}
