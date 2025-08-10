import { IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { DocumentType, EntityType } from '../entities/document.entity';

export class UploadDocumentDto {
  @ApiProperty({ description: 'Document title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Document description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Type of document',
    enum: DocumentType,
  })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({
    description: 'Entity type this document is attached to',
    enum: EntityType,
  })
  @IsEnum(EntityType)
  entityType: EntityType;

  @ApiProperty({ description: 'ID of the entity this document is attached to' })
  @IsString()
  entityId: string;

  @ApiPropertyOptional({ description: 'Whether document is publicly accessible', default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Access level for the document',
    enum: ['PUBLIC', 'INTERNAL', 'RESTRICTED', 'PRIVATE'],
    default: 'INTERNAL',
  })
  @IsOptional()
  @IsString()
  accessLevel?: 'PUBLIC' | 'INTERNAL' | 'RESTRICTED' | 'PRIVATE';

  @ApiPropertyOptional({
    description: 'Document metadata',
    example: {
      issuer: 'Certification Authority',
      validUntil: '2024-12-31',
      tags: ['quality', 'iso9001'],
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: {
    // For certificates
    issuer?: string;
    validFrom?: string;
    validUntil?: string;
    certificateNumber?: string;
    certificationType?: string;

    // For generated documents
    generatedFor?: string;
    template?: string;
    version?: string;

    // For product-related documents
    productId?: string;
    supplierId?: string;

    // For delivery/order discrepancies
    deliveryId?: string;
    orderProductId?: string;
    orderId?: string;
    discrepancyType?: string;
    severity?: string;
    reportedBy?: string;
    reportedAt?: string;
    location?: string;
    description?: string;
    discoveredDate?: string;
    daysAfterDelivery?: number;
    customerReported?: boolean;
    affectedQuantity?: number;
    customerComplaintId?: string;
    requiresAction?: boolean;
    isPostDelivery?: boolean;
    daysSinceDelivery?: number;

    // General
    tags?: string[];
    customFields?: Record<string, unknown>;
  };

  @ApiPropertyOptional({ description: 'Parent document ID for versioning' })
  @IsOptional()
  @IsString()
  parentDocumentId?: string;
}

export class BulkUploadDocumentDto {
  @ApiProperty({ description: 'Common entity type for all documents' })
  @IsEnum(EntityType)
  entityType: EntityType;

  @ApiProperty({ description: 'Common entity ID for all documents' })
  @IsString()
  entityId: string;

  @ApiProperty({ description: 'Common document type for all documents' })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiPropertyOptional({ description: 'Common access level for all documents' })
  @IsOptional()
  @IsString()
  accessLevel?: 'PUBLIC' | 'INTERNAL' | 'RESTRICTED' | 'PRIVATE';

  @ApiPropertyOptional({ description: 'Common metadata for all documents' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateDocumentDto {
  @ApiPropertyOptional({ description: 'Document title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Document description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether document is publicly accessible' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Access level for the document' })
  @IsOptional()
  @IsString()
  accessLevel?: 'PUBLIC' | 'INTERNAL' | 'RESTRICTED' | 'PRIVATE';

  @ApiPropertyOptional({ description: 'Document metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Document status',
    enum: ['DRAFT', 'ACTIVE', 'ARCHIVED', 'EXPIRED'],
  })
  @IsOptional()
  @IsString()
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'EXPIRED';
}

export class DocumentFiltersDto {
  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by document type' })
  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @ApiPropertyOptional({ description: 'Filter by entity type' })
  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @ApiPropertyOptional({ description: 'Filter by entity ID' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by access level' })
  @IsOptional()
  @IsString()
  accessLevel?: string;

  @ApiPropertyOptional({ description: 'Filter by public access' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Filter by MIME type' })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ description: 'Show only expired documents' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  onlyExpired?: boolean;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Sort by field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', default: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
