import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { UserRole } from '@common/enums/user-role.enum';
import { EntityType } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  nomComplet: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsEnum(EntityType)
  entiteType?: EntityType;

  @IsOptional()
  @IsUUID()
  entiteId?: string;
}