import { IsString, IsEnum } from 'class-validator';
import { ProductCategory } from '@common/enums/product-category.enum';

export class CreateProductDto {
  @IsString()
  productCode: string;

  @IsString()
  description: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;
}