import { IsString, IsEnum } from 'class-validator';
import { ArticleCategory } from '@common/enums/article-category.enum';

export class CreateArticleDto {
  @IsString()
  codeArticle: string;

  @IsString()
  designation: string;

  @IsEnum(ArticleCategory)
  categorie: ArticleCategory;
}