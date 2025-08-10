import { IsArray, IsBoolean, IsDateString, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccessEntityType, AccessType } from '../entities/document-access.entity';

export class GrantDocumentAccessDto {
  @ApiProperty({ description: 'Document ID' })
  @IsString()
  documentId: string;

  @ApiProperty({
    description: 'Type of access to grant',
    enum: AccessType,
  })
  @IsEnum(AccessType)
  accessType: AccessType;

  @ApiProperty({
    description: 'Type of entity to grant access to',
    enum: AccessEntityType,
  })
  @IsEnum(AccessEntityType)
  entityType: AccessEntityType;

  @ApiProperty({ description: 'ID of entity to grant access to' })
  @IsString()
  entityId: string;

  @ApiPropertyOptional({ description: 'Access expiration date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Access constraints' })
  @IsOptional()
  @IsObject()
  constraints?: {
    allowedIPs?: string[];
    accessHoursStart?: string;
    accessHoursEnd?: string;
    maxDownloads?: number;
    customRules?: Record<string, unknown>;
  };
}

export class BulkGrantAccessDto {
  @ApiProperty({ description: 'Document IDs' })
  @IsArray()
  @IsString({ each: true })
  documentIds: string[];

  @ApiProperty({
    description: 'Type of access to grant',
    enum: AccessType,
  })
  @IsEnum(AccessType)
  accessType: AccessType;

  @ApiProperty({
    description: 'Type of entity to grant access to',
    enum: AccessEntityType,
  })
  @IsEnum(AccessEntityType)
  entityType: AccessEntityType;

  @ApiProperty({ description: 'ID of entity to grant access to' })
  @IsString()
  entityId: string;

  @ApiPropertyOptional({ description: 'Access expiration date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Access constraints' })
  @IsOptional()
  @IsObject()
  constraints?: Record<string, unknown>;
}

export class UpdateDocumentAccessDto {
  @ApiPropertyOptional({ description: 'Whether access is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'New expiration date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Updated access constraints' })
  @IsOptional()
  @IsObject()
  constraints?: Record<string, unknown>;
}

export class DocumentAccessFiltersDto {
  @ApiPropertyOptional({ description: 'Filter by document ID' })
  @IsOptional()
  @IsString()
  documentId?: string;

  @ApiPropertyOptional({ description: 'Filter by entity type' })
  @IsOptional()
  @IsEnum(AccessEntityType)
  entityType?: AccessEntityType;

  @ApiPropertyOptional({ description: 'Filter by entity ID' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Filter by access type' })
  @IsOptional()
  @IsEnum(AccessType)
  accessType?: AccessType;

  @ApiPropertyOptional({ description: 'Show only active access' })
  @IsOptional()
  @IsBoolean()
  onlyActive?: boolean;

  @ApiPropertyOptional({ description: 'Show only expired access' })
  @IsOptional()
  @IsBoolean()
  onlyExpired?: boolean;
}
