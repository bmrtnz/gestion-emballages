import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentStatus, DocumentType } from './entities/document.entity';
import { AccessEntityType, AccessType, DocumentAccess } from './entities/document-access.entity';
import { DocumentStorageService } from './services/document-storage.service';
import { DocumentFiltersDto, UpdateDocumentDto, UploadDocumentDto } from './dto/upload-document.dto';
import { GrantDocumentAccessDto } from './dto/document-access.dto';
import { PaginationService } from '@common/services/pagination.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,

    @InjectRepository(DocumentAccess)
    private documentAccessRepository: Repository<DocumentAccess>,

    private documentStorageService: DocumentStorageService,
    private paginationService: PaginationService
  ) {}

  /**
   * Upload a new document
   */
  async uploadDocument(
    file: Express.Multer.File,
    uploadDto: UploadDocumentDto,
    uploadedById: string
  ): Promise<Document> {
    // Validate file
    this.validateFile(file, uploadDto.documentType);

    // Generate file path based on document type and entity
    const bucketInfo = this.documentStorageService.getBucketInfo(uploadDto.documentType, uploadDto.entityType);

    const filePath = this.documentStorageService.generateFilePath(
      uploadDto.documentType,
      uploadDto.entityType,
      uploadDto.entityId,
      file.originalname
    );

    // Upload to MinIO
    await this.documentStorageService.uploadFile(bucketInfo.bucket, filePath, file.buffer, file.mimetype, {
      'uploaded-by': uploadedById,
      'document-type': uploadDto.documentType,
      'entity-type': uploadDto.entityType,
      'entity-id': uploadDto.entityId,
    });

    // Handle versioning for existing documents
    let version = 1;
    if (uploadDto.parentDocumentId) {
      const parentDoc = await this.documentRepository.findOne({
        where: { id: uploadDto.parentDocumentId },
      });
      if (parentDoc) {
        version = parentDoc.version + 1;
      }
    }

    // Create document record
    const document = this.documentRepository.create({
      title: uploadDto.title,
      description: uploadDto.description,
      documentType: uploadDto.documentType,
      entityType: uploadDto.entityType,
      entityId: uploadDto.entityId,
      fileName: filePath.split('/').pop(),
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      filePath,
      minioBucket: bucketInfo.bucket,
      isPublic: uploadDto.isPublic || bucketInfo.isPublic,
      accessLevel: uploadDto.accessLevel || 'INTERNAL',
      metadata: uploadDto.metadata || {},
      version,
      parentDocumentId: uploadDto.parentDocumentId,
      uploadedById,
      status: DocumentStatus.ACTIVE,
    });

    const savedDocument = await this.documentRepository.save(document);

    // Auto-grant access based on entity type
    await this.autoGrantAccess(savedDocument, uploadedById);

    return savedDocument;
  }

  /**
   * Get documents with filters and pagination
   */
  async getDocuments(filters: DocumentFiltersDto, userId: string) {
    const queryBuilder = this.documentRepository
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.uploadedBy', 'uploadedBy')
      .leftJoinAndSelect('doc.parentDocument', 'parentDocument');

    // Apply filters
    if (filters.search) {
      queryBuilder.andWhere(
        '(doc.title ILIKE :search OR doc.description ILIKE :search OR doc.originalName ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.documentType) {
      queryBuilder.andWhere('doc.documentType = :documentType', {
        documentType: filters.documentType,
      });
    }

    if (filters.entityType) {
      queryBuilder.andWhere('doc.entityType = :entityType', {
        entityType: filters.entityType,
      });
    }

    if (filters.entityId) {
      queryBuilder.andWhere('doc.entityId = :entityId', {
        entityId: filters.entityId,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere('doc.status = :status', { status: filters.status });
    }

    if (filters.accessLevel) {
      queryBuilder.andWhere('doc.accessLevel = :accessLevel', {
        accessLevel: filters.accessLevel,
      });
    }

    if (filters.isPublic !== undefined) {
      queryBuilder.andWhere('doc.isPublic = :isPublic', {
        isPublic: filters.isPublic,
      });
    }

    if (filters.mimeType) {
      queryBuilder.andWhere('doc.mimeType ILIKE :mimeType', {
        mimeType: `%${filters.mimeType}%`,
      });
    }

    if (filters.onlyExpired) {
      queryBuilder.andWhere("doc.metadata->>'validUntil' IS NOT NULL AND doc.metadata->>'validUntil' < :now", {
        now: new Date().toISOString(),
      });
    }

    // Apply access control - user can only see documents they have access to
    queryBuilder.andWhere(
      `(
        doc.isPublic = true 
        OR doc.uploadedById = :userId 
        OR EXISTS (
          SELECT 1 FROM document_access da 
          WHERE da.documentId = doc.id 
          AND da.entityType = 'USER' 
          AND da.entityId = :userId 
          AND da.isActive = true
          AND (da.expiresAt IS NULL OR da.expiresAt > :now)
        )
      )`,
      { userId, now: new Date() }
    );

    // Apply sorting
    queryBuilder.orderBy(`doc.${filters.sortBy}`, filters.sortOrder);

    // Apply pagination
    const skip = this.paginationService.getSkip(filters.page, filters.limit);
    queryBuilder.skip(skip).take(filters.limit);

    // Get results and total count
    const [data, total] = await queryBuilder.getManyAndCount();

    return this.paginationService.createPaginatedResponse(data, total, {
      page: filters.page,
      limit: filters.limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
  }

  /**
   * Get document by ID with access control
   */
  async getDocumentById(id: string, userId: string): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['uploadedBy', 'parentDocument'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Check access
    if (!(await this.hasAccess(document.id, userId, AccessType.READ))) {
      throw new ForbiddenException('Access denied to this document');
    }

    return document;
  }

  /**
   * Update document metadata
   */
  async updateDocument(id: string, updateDto: UpdateDocumentDto, userId: string): Promise<Document> {
    const document = await this.getDocumentById(id, userId);

    // Check write access
    if (!(await this.hasAccess(document.id, userId, AccessType.WRITE))) {
      throw new ForbiddenException('No write access to this document');
    }

    Object.assign(document, updateDto);
    return this.documentRepository.save(document);
  }

  /**
   * Delete document
   */
  async deleteDocument(id: string, userId: string): Promise<void> {
    const document = await this.getDocumentById(id, userId);

    // Check delete access
    if (!(await this.hasAccess(document.id, userId, AccessType.DELETE))) {
      throw new ForbiddenException('No delete access to this document');
    }

    // Delete from MinIO
    await this.documentStorageService.deleteFile(document.minioBucket, document.filePath);

    // Hard delete from database (documents don't use soft delete)
    await this.documentRepository.remove(document);
  }

  /**
   * Get download URL for document
   */
  async getDownloadUrl(id: string, userId: string): Promise<string> {
    const document = await this.getDocumentById(id, userId);

    // Update access stats
    document.downloadCount += 1;
    document.lastAccessedAt = new Date();
    await this.documentRepository.save(document);

    if (document.isPublic) {
      return this.documentStorageService.getPublicUrl(document.minioBucket, document.filePath);
    }

    // Generate presigned URL for private documents
    return this.documentStorageService.getPresignedUrl(
      document.minioBucket,
      document.filePath,
      3600 // 1 hour expiry
    );
  }

  /**
   * Grant access to document
   */
  async grantAccess(grantDto: GrantDocumentAccessDto, grantedById: string): Promise<DocumentAccess> {
    // Check if requester has admin access to the document
    if (!(await this.hasAccess(grantDto.documentId, grantedById, AccessType.ADMIN))) {
      throw new ForbiddenException('No admin access to grant permissions');
    }

    const documentAccess = this.documentAccessRepository.create({
      ...grantDto,
      grantedById,
      constraints: grantDto.constraints || {},
    });

    return this.documentAccessRepository.save(documentAccess);
  }

  /**
   * Check if user has access to document
   */
  private async hasAccess(documentId: string, userId: string, accessType: AccessType): Promise<boolean> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) return false;

    // Public documents have read access for everyone
    if (document.isPublic && accessType === AccessType.READ) {
      return true;
    }

    // Document owner has all access
    if (document.uploadedById === userId) {
      return true;
    }

    // Check explicit access grants
    const access = await this.documentAccessRepository.findOne({
      where: {
        documentId,
        entityType: AccessEntityType.USER,
        entityId: userId,
        accessType,
        isActive: true,
      },
    });

    return access ? access.canAccessNow : false;
  }

  /**
   * Auto-grant access based on entity relationships
   */
  private async autoGrantAccess(document: Document, uploadedById: string): Promise<void> {
    // Grant admin access to uploader
    await this.documentAccessRepository.save(
      this.documentAccessRepository.create({
        documentId: document.id,
        accessType: AccessType.ADMIN,
        entityType: AccessEntityType.USER,
        entityId: uploadedById,
        grantedById: uploadedById,
      })
    );

    // Grant read access to related entities based on business rules
    // This would be expanded based on your specific business logic
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: Express.Multer.File, documentType: DocumentType): void {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = this.getAllowedMimeTypes(documentType);

    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 50MB limit');
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} not allowed for ${documentType}`);
    }
  }

  /**
   * Get allowed MIME types for document type
   */
  private getAllowedMimeTypes(documentType: DocumentType): string[] {
    switch (documentType) {
      case DocumentType.PRODUCT_IMAGE:
        return ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

      case DocumentType.PLATFORM_CERTIFICATION:
      case DocumentType.SUPPLIER_CERTIFICATION:
      case DocumentType.STATION_CERTIFICATION:
      case DocumentType.QUALITY_CERTIFICATE:
      case DocumentType.SAFETY_CERTIFICATE:
        return ['application/pdf', 'image/jpeg', 'image/png'];

      // Product certifications - mainly PDFs but allow images for certificates
      case DocumentType.PRODUCT_QUALITY_CERTIFICATE:
      case DocumentType.PRODUCT_SAFETY_CERTIFICATE:
      case DocumentType.PRODUCT_COMPLIANCE_CERTIFICATE:
      case DocumentType.PRODUCT_SPECIFICATION_SHEET:
      case DocumentType.PRODUCT_MATERIAL_CERTIFICATE:
      case DocumentType.PRODUCT_TEST_REPORT:
        return ['application/pdf', 'image/jpeg', 'image/png'];

      // Discrepancy photos - only images (delivery-time and post-delivery)
      case DocumentType.DELIVERY_DISCREPANCY_PHOTO:
      case DocumentType.PRODUCT_DISCREPANCY_PHOTO:
      case DocumentType.QUALITY_ISSUE_PHOTO:
      case DocumentType.DAMAGE_REPORT_PHOTO:
      case DocumentType.NON_CONFORMITY_PHOTO:
      case DocumentType.POST_DELIVERY_DAMAGE_PHOTO:
      case DocumentType.POST_DELIVERY_QUALITY_ISSUE_PHOTO:
      case DocumentType.POST_DELIVERY_MISSING_ITEMS_PHOTO:
      case DocumentType.POST_DELIVERY_WRONG_ITEMS_PHOTO:
      case DocumentType.POST_DELIVERY_CONTAMINATION_PHOTO:
      case DocumentType.POST_DELIVERY_SPOILAGE_PHOTO:
      case DocumentType.CUSTOMER_COMPLAINT_PHOTO:
        return ['image/jpeg', 'image/png', 'image/webp'];

      default:
        return [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'image/jpeg',
          'image/png',
        ];
    }
  }

  /**
   * Get urgent discrepancy documents
   */
  async getUrgentDiscrepancies(userId: string) {
    const queryBuilder = this.documentRepository
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.uploadedBy', 'uploadedBy')
      .where('doc.documentType IN (:...discrepancyTypes)', {
        discrepancyTypes: [
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
        ],
      })
      .andWhere('doc.status = :status', { status: DocumentStatus.ACTIVE })
      .andWhere('doc.createdAt > :since', {
        since: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      })
      .orderBy('doc.createdAt', 'DESC');

    // Apply access control
    queryBuilder.andWhere(
      `(
        doc.isPublic = true 
        OR doc.uploadedById = :userId 
        OR EXISTS (
          SELECT 1 FROM document_access da 
          WHERE da.documentId = doc.id 
          AND da.entityType = 'USER' 
          AND da.entityId = :userId 
          AND da.isActive = true
          AND (da.expiresAt IS NULL OR da.expiresAt > :now)
        )
      )`,
      { userId, now: new Date() }
    );

    return queryBuilder.getMany();
  }

  /**
   * Get post-delivery discrepancies (may require different handling/timeframes)
   */
  async getPostDeliveryDiscrepancies(userId: string, daysSince: number = 7) {
    const queryBuilder = this.documentRepository
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.uploadedBy', 'uploadedBy')
      .where('doc.documentType IN (:...postDeliveryTypes)', {
        postDeliveryTypes: [
          DocumentType.POST_DELIVERY_DAMAGE_PHOTO,
          DocumentType.POST_DELIVERY_QUALITY_ISSUE_PHOTO,
          DocumentType.POST_DELIVERY_MISSING_ITEMS_PHOTO,
          DocumentType.POST_DELIVERY_WRONG_ITEMS_PHOTO,
          DocumentType.POST_DELIVERY_CONTAMINATION_PHOTO,
          DocumentType.POST_DELIVERY_SPOILAGE_PHOTO,
          DocumentType.CUSTOMER_COMPLAINT_PHOTO,
        ],
      })
      .andWhere('doc.status = :status', { status: DocumentStatus.ACTIVE })
      .andWhere('doc.createdAt > :since', {
        since: new Date(Date.now() - daysSince * 24 * 60 * 60 * 1000),
      })
      .orderBy('doc.createdAt', 'DESC');

    // Apply access control
    queryBuilder.andWhere(
      `(
        doc.isPublic = true 
        OR doc.uploadedById = :userId 
        OR EXISTS (
          SELECT 1 FROM document_access da 
          WHERE da.documentId = doc.id 
          AND da.entityType = 'USER' 
          AND da.entityId = :userId 
          AND da.isActive = true
          AND (da.expiresAt IS NULL OR da.expiresAt > :now)
        )
      )`,
      { userId, now: new Date() }
    );

    return queryBuilder.getMany();
  }

  /**
   * Get discrepancies by timeline (delivery vs post-delivery)
   */
  async getDiscrepanciesByTimeline(userId: string, timeline: 'delivery' | 'post-delivery' | 'all' = 'all') {
    const queryBuilder = this.documentRepository
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.uploadedBy', 'uploadedBy');

    if (timeline === 'delivery') {
      queryBuilder.where('doc.documentType IN (:...deliveryTypes)', {
        deliveryTypes: [
          DocumentType.DELIVERY_DISCREPANCY_PHOTO,
          DocumentType.PRODUCT_DISCREPANCY_PHOTO,
          DocumentType.QUALITY_ISSUE_PHOTO,
          DocumentType.DAMAGE_REPORT_PHOTO,
          DocumentType.NON_CONFORMITY_PHOTO,
        ],
      });
    } else if (timeline === 'post-delivery') {
      queryBuilder.where('doc.documentType IN (:...postDeliveryTypes)', {
        postDeliveryTypes: [
          DocumentType.POST_DELIVERY_DAMAGE_PHOTO,
          DocumentType.POST_DELIVERY_QUALITY_ISSUE_PHOTO,
          DocumentType.POST_DELIVERY_MISSING_ITEMS_PHOTO,
          DocumentType.POST_DELIVERY_WRONG_ITEMS_PHOTO,
          DocumentType.POST_DELIVERY_CONTAMINATION_PHOTO,
          DocumentType.POST_DELIVERY_SPOILAGE_PHOTO,
          DocumentType.CUSTOMER_COMPLAINT_PHOTO,
        ],
      });
    } else {
      // All discrepancies
      queryBuilder.where('doc.documentType IN (:...allDiscrepancyTypes)', {
        allDiscrepancyTypes: [
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
        ],
      });
    }

    queryBuilder.andWhere('doc.status = :status', { status: DocumentStatus.ACTIVE }).orderBy('doc.createdAt', 'DESC');

    // Apply access control
    queryBuilder.andWhere(
      `(
        doc.isPublic = true 
        OR doc.uploadedById = :userId 
        OR EXISTS (
          SELECT 1 FROM document_access da 
          WHERE da.documentId = doc.id 
          AND da.entityType = 'USER' 
          AND da.entityId = :userId 
          AND da.isActive = true
          AND (da.expiresAt IS NULL OR da.expiresAt > :now)
        )
      )`,
      { userId, now: new Date() }
    );

    return queryBuilder.getMany();
  }
}
