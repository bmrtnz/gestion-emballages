import { IsString, IsEmail, IsOptional, IsBoolean, IsPhoneNumber, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlatformContactDto {
  @ApiProperty({ description: 'Full name of the contact' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName: string;

  @ApiPropertyOptional({ description: 'Position or role of the contact' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @ApiPropertyOptional({ description: 'Phone number of the contact' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'Email address of the contact' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ description: 'Whether this is the principal contact', default: false })
  @IsOptional()
  @IsBoolean()
  isPrincipal?: boolean = false;

  @ApiPropertyOptional({ description: 'Whether the contact is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}