import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { User } from '@modules/users/entities/user.entity';

export enum DocumentType {
  // Product visuals
  PRODUCT_IMAGE = 'PRODUCT_IMAGE',

  // Certification documents
  PLATFORM_CERTIFICATION = 'PLATFORM_CERTIFICATION',
  SUPPLIER_CERTIFICATION = 'SUPPLIER_CERTIFICATION',
  STATION_CERTIFICATION = 'STATION_CERTIFICATION',
  QUALITY_CERTIFICATE = 'QUALITY_CERTIFICATE',
  SAFETY_CERTIFICATE = 'SAFETY_CERTIFICATE',

  // Product-level certifications (per supplier)
  PRODUCT_QUALITY_CERTIFICATE = 'PRODUCT_QUALITY_CERTIFICATE',
  PRODUCT_SAFETY_CERTIFICATE = 'PRODUCT_SAFETY_CERTIFICATE',
  PRODUCT_COMPLIANCE_CERTIFICATE = 'PRODUCT_COMPLIANCE_CERTIFICATE',
  PRODUCT_SPECIFICATION_SHEET = 'PRODUCT_SPECIFICATION_SHEET',
  PRODUCT_MATERIAL_CERTIFICATE = 'PRODUCT_MATERIAL_CERTIFICATE',
  PRODUCT_TEST_REPORT = 'PRODUCT_TEST_REPORT',

  // Discrepancy documentation
  DELIVERY_DISCREPANCY_PHOTO = 'DELIVERY_DISCREPANCY_PHOTO',
  PRODUCT_DISCREPANCY_PHOTO = 'PRODUCT_DISCREPANCY_PHOTO',
  QUALITY_ISSUE_PHOTO = 'QUALITY_ISSUE_PHOTO',
  DAMAGE_REPORT_PHOTO = 'DAMAGE_REPORT_PHOTO',
  NON_CONFORMITY_PHOTO = 'NON_CONFORMITY_PHOTO',

  // Post-delivery discrepancies (discovered after delivery completion)
  POST_DELIVERY_DAMAGE_PHOTO = 'POST_DELIVERY_DAMAGE_PHOTO',
  POST_DELIVERY_QUALITY_ISSUE_PHOTO = 'POST_DELIVERY_QUALITY_ISSUE_PHOTO',
  POST_DELIVERY_MISSING_ITEMS_PHOTO = 'POST_DELIVERY_MISSING_ITEMS_PHOTO',
  POST_DELIVERY_WRONG_ITEMS_PHOTO = 'POST_DELIVERY_WRONG_ITEMS_PHOTO',
  POST_DELIVERY_CONTAMINATION_PHOTO = 'POST_DELIVERY_CONTAMINATION_PHOTO',
  POST_DELIVERY_SPOILAGE_PHOTO = 'POST_DELIVERY_SPOILAGE_PHOTO',
  CUSTOMER_COMPLAINT_PHOTO = 'CUSTOMER_COMPLAINT_PHOTO',

  // Generated business documents
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  SALES_ORDER = 'SALES_ORDER',
  MASTER_ORDER = 'MASTER_ORDER',
  INVOICE = 'INVOICE',
  DELIVERY_NOTE = 'DELIVERY_NOTE',
  PACKING_LIST = 'PACKING_LIST',

  // Reports
  STOCK_REPORT = 'STOCK_REPORT',
  SALES_REPORT = 'SALES_REPORT',
  PLATFORM_REPORT = 'PLATFORM_REPORT',

  // Other documents
  CONTRACT = 'CONTRACT',
  SPECIFICATION = 'SPECIFICATION',
  OTHER = 'OTHER',
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  EXPIRED = 'EXPIRED',
}

export enum EntityType {
  PRODUCT_SUPPLIER = 'PRODUCT_SUPPLIER',
  PLATFORM = 'PLATFORM',
  SUPPLIER = 'SUPPLIER',
  STATION = 'STATION',
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  SALES_ORDER = 'SALES_ORDER',
  MASTER_ORDER = 'MASTER_ORDER',
  USER = 'USER',
  DELIVERY = 'DELIVERY',
  ORDER_PRODUCT = 'ORDER_PRODUCT', // For product-level discrepancies in specific orders
  TRANSFER_REQUEST = 'TRANSFER_REQUEST',
  STOCK_MOVEMENT = 'STOCK_MOVEMENT',
}

@Entity('documents')
export class Document extends BaseEntity {
  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  documentType: DocumentType;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.ACTIVE,
  })
  status: DocumentStatus;

  // Polymorphic relationship - can be attached to different entity types
  @Column({
    type: 'enum',
    enum: EntityType,
  })
  entityType: EntityType;

  @Column({ name: 'entity_id' })
  entityId: string;

  // File information
  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  @Column({ name: 'file_path' })
  filePath: string; // Path in MinIO

  @Column({ name: 'minio_bucket' })
  minioBucket: string;

  // Security and access
  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'access_level', default: 'INTERNAL' })
  accessLevel: 'PUBLIC' | 'INTERNAL' | 'RESTRICTED' | 'PRIVATE';

  // Document metadata
  @Column({ type: 'jsonb', default: {} })
  metadata: {
    // For images
    width?: number;
    height?: number;

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

    // Custom metadata
    tags?: string[];
    customFields?: Record<string, unknown>;
  };

  // Version control
  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ name: 'parent_document_id', nullable: true })
  parentDocumentId?: string;

  // Audit fields
  @Column({ name: 'uploaded_by' })
  uploadedById: string;

  @Column({ name: 'last_accessed_at', type: 'timestamp', nullable: true })
  lastAccessedAt?: Date;

  @Column({ name: 'download_count', type: 'int', default: 0 })
  downloadCount: number;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy: User;

  @ManyToOne(() => Document, { nullable: true })
  @JoinColumn({ name: 'parent_document_id' })
  parentDocument?: Document;

  // Virtual properties
  get fileExtension(): string {
    return this.fileName.split('.').pop()?.toLowerCase() || '';
  }

  get isImage(): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    return imageExtensions.includes(this.fileExtension);
  }

  get isPdf(): boolean {
    return this.fileExtension === 'pdf';
  }

  get isExpired(): boolean {
    if (!this.metadata.validUntil) return false;
    return new Date(this.metadata.validUntil) < new Date();
  }

  get sizeFormatted(): string {
    const bytes = Number(this.fileSize);
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // Helper methods for entity relationships
  get isProductImage(): boolean {
    return this.documentType === DocumentType.PRODUCT_IMAGE && this.entityType === EntityType.PRODUCT_SUPPLIER;
  }

  get isCertification(): boolean {
    return [
      DocumentType.PLATFORM_CERTIFICATION,
      DocumentType.SUPPLIER_CERTIFICATION,
      DocumentType.STATION_CERTIFICATION,
      DocumentType.QUALITY_CERTIFICATE,
      DocumentType.SAFETY_CERTIFICATE,
    ].includes(this.documentType);
  }

  get isGeneratedDocument(): boolean {
    return [
      DocumentType.PURCHASE_ORDER,
      DocumentType.SALES_ORDER,
      DocumentType.MASTER_ORDER,
      DocumentType.INVOICE,
      DocumentType.DELIVERY_NOTE,
      DocumentType.PACKING_LIST,
    ].includes(this.documentType);
  }

  get isProductCertification(): boolean {
    return [
      DocumentType.PRODUCT_QUALITY_CERTIFICATE,
      DocumentType.PRODUCT_SAFETY_CERTIFICATE,
      DocumentType.PRODUCT_COMPLIANCE_CERTIFICATE,
      DocumentType.PRODUCT_SPECIFICATION_SHEET,
      DocumentType.PRODUCT_MATERIAL_CERTIFICATE,
      DocumentType.PRODUCT_TEST_REPORT,
    ].includes(this.documentType);
  }

  get isDiscrepancyPhoto(): boolean {
    return [
      DocumentType.DELIVERY_DISCREPANCY_PHOTO,
      DocumentType.PRODUCT_DISCREPANCY_PHOTO,
      DocumentType.QUALITY_ISSUE_PHOTO,
      DocumentType.DAMAGE_REPORT_PHOTO,
      DocumentType.NON_CONFORMITY_PHOTO,
      DocumentType.POST_DELIVERY_DAMAGE_PHOTO,
      DocumentType.POST_DELIVERY_QUALITY_ISSUE_PHOTO,
      DocumentType.POST_DELIVERY_MISSING_ITEMS_PHOTO,
      DocumentType.POST_DELIVERY_WRONG_ITEMS_PHOTO,
      DocumentType.POST_DELIVERY_CONTAMINATION_PHOTO,
      DocumentType.POST_DELIVERY_SPOILAGE_PHOTO,
      DocumentType.CUSTOMER_COMPLAINT_PHOTO,
    ].includes(this.documentType);
  }

  get isPostDeliveryDiscrepancy(): boolean {
    return [
      DocumentType.POST_DELIVERY_DAMAGE_PHOTO,
      DocumentType.POST_DELIVERY_QUALITY_ISSUE_PHOTO,
      DocumentType.POST_DELIVERY_MISSING_ITEMS_PHOTO,
      DocumentType.POST_DELIVERY_WRONG_ITEMS_PHOTO,
      DocumentType.POST_DELIVERY_CONTAMINATION_PHOTO,
      DocumentType.POST_DELIVERY_SPOILAGE_PHOTO,
      DocumentType.CUSTOMER_COMPLAINT_PHOTO,
    ].includes(this.documentType);
  }

  get isDeliveryTimeDiscrepancy(): boolean {
    return [
      DocumentType.DELIVERY_DISCREPANCY_PHOTO,
      DocumentType.PRODUCT_DISCREPANCY_PHOTO,
      DocumentType.QUALITY_ISSUE_PHOTO,
      DocumentType.DAMAGE_REPORT_PHOTO,
      DocumentType.NON_CONFORMITY_PHOTO,
    ].includes(this.documentType);
  }

  get requiresUrgentAction(): boolean {
    // Discrepancy photos typically require immediate attention
    return (
      this.isDiscrepancyPhoto &&
      this.status === DocumentStatus.ACTIVE &&
      Date.now() - this.createdAt.getTime() < 24 * 60 * 60 * 1000
    ); // Less than 24 hours old
  }
}
