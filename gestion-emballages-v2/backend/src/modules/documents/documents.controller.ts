import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';

// Interface for authenticated request
interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: UserRole;
    entityId?: string;
    entityType?: string;
  };
}
import { DocumentsService } from './documents.service';
import {
  BulkUploadDocumentDto,
  DocumentFiltersDto,
  UpdateDocumentDto,
  UploadDocumentDto,
} from './dto/upload-document.dto';
import { BulkGrantAccessDto, GrantDocumentAccessDto } from './dto/document-access.dto';
import { Document, DocumentType, EntityType } from './entities/document.entity';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a single document' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Document uploaded successfully', type: Document })
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadDocumentDto,
    @Request() req: AuthenticatedRequest
  ): Promise<Document> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.documentsService.uploadDocument(file, uploadDto, req.user.id);
  }

  @Post('upload-bulk')
  @ApiOperation({ summary: 'Upload multiple documents with same metadata' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Documents uploaded successfully' })
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  async uploadBulkDocuments(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() bulkUploadDto: BulkUploadDocumentDto,
    @Request() req: AuthenticatedRequest
  ): Promise<Document[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadPromises = files.map((file, _index) => {
      const uploadDto: UploadDocumentDto = {
        title: file.originalname,
        documentType: bulkUploadDto.documentType,
        entityType: bulkUploadDto.entityType,
        entityId: bulkUploadDto.entityId,
        accessLevel: bulkUploadDto.accessLevel,
        metadata: bulkUploadDto.metadata,
      };

      return this.documentsService.uploadDocument(file, uploadDto, req.user.id);
    });

    return Promise.all(uploadPromises);
  }

  @Get()
  @ApiOperation({ summary: 'Get documents with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  async getDocuments(@Query() filters: DocumentFiltersDto, @Request() req: AuthenticatedRequest) {
    return this.documentsService.getDocuments(filters, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({ status: 200, description: 'Document found', type: Document })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDocumentById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest
  ): Promise<Document> {
    return this.documentsService.getDocumentById(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update document metadata' })
  @ApiResponse({ status: 200, description: 'Document updated successfully', type: Document })
  async updateDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateDocumentDto,
    @Request() req: AuthenticatedRequest
  ): Promise<Document> {
    return this.documentsService.updateDocument(id, updateDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  async deleteDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest
  ): Promise<{ message: string }> {
    await this.documentsService.deleteDocument(id, req.user.id);
    return { message: 'Document deleted successfully' };
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get download URL for document' })
  @ApiResponse({ status: 200, description: 'Download URL generated' })
  async getDownloadUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest
  ): Promise<{ downloadUrl: string }> {
    const downloadUrl = await this.documentsService.getDownloadUrl(id, req.user.id);
    return { downloadUrl };
  }

  @Post(':id/access')
  @ApiOperation({ summary: 'Grant access to document' })
  @ApiResponse({ status: 201, description: 'Access granted successfully' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async grantAccess(
    @Param('id', ParseUUIDPipe) documentId: string,
    @Body() grantDto: Omit<GrantDocumentAccessDto, 'documentId'>,
    @Request() req: AuthenticatedRequest
  ) {
    const fullGrantDto: GrantDocumentAccessDto = {
      ...grantDto,
      documentId,
    };
    return this.documentsService.grantAccess(fullGrantDto, req.user.id);
  }

  @Post('access/bulk')
  @ApiOperation({ summary: 'Grant access to multiple documents' })
  @ApiResponse({ status: 201, description: 'Bulk access granted successfully' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async grantBulkAccess(@Body() bulkGrantDto: BulkGrantAccessDto, @Request() req: AuthenticatedRequest) {
    const grantPromises = bulkGrantDto.documentIds.map(documentId => {
      const grantDto: GrantDocumentAccessDto = {
        documentId,
        accessType: bulkGrantDto.accessType,
        entityType: bulkGrantDto.entityType,
        entityId: bulkGrantDto.entityId,
        expiresAt: bulkGrantDto.expiresAt,
        constraints: bulkGrantDto.constraints,
      };
      return this.documentsService.grantAccess(grantDto, req.user.id);
    });

    const results = await Promise.all(grantPromises);
    return {
      message: 'Bulk access granted successfully',
      grantedCount: results.length,
    };
  }

  // Entity-specific endpoints for easier integration

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get documents for specific entity' })
  @ApiResponse({ status: 200, description: 'Entity documents retrieved' })
  async getEntityDocuments(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Query() additionalFilters: Omit<DocumentFiltersDto, 'entityType' | 'entityId'>,
    @Request() req: AuthenticatedRequest
  ) {
    const filters: DocumentFiltersDto = {
      ...additionalFilters,
      entityType: entityType as EntityType,
      entityId,
    };
    return this.documentsService.getDocuments(filters, req.user.id);
  }

  @Post('entity/:entityType/:entityId/upload')
  @ApiOperation({ summary: 'Upload document for specific entity' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadEntityDocument(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: Omit<UploadDocumentDto, 'entityType' | 'entityId'>,
    @Request() req: AuthenticatedRequest
  ): Promise<Document> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const fullUploadDto: UploadDocumentDto = {
      ...uploadDto,
      entityType: entityType as EntityType,
      entityId,
    };

    return this.documentsService.uploadDocument(file, fullUploadDto, req.user.id);
  }

  // Product image specific endpoints

  @Post('products/:productId/suppliers/:supplierId/image')
  @ApiOperation({ summary: 'Upload product image for specific supplier' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async uploadProductImage(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata: { title?: string; description?: string },
    @Request() req: AuthenticatedRequest
  ): Promise<Document> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    // For product images, entityId should be the ProductSupplier relationship ID
    // This might need adjustment based on your ProductSupplier entity structure
    const uploadDto: UploadDocumentDto = {
      title: metadata.title || `${file.originalname} - Product Image`,
      description: metadata.description,
      documentType: DocumentType.PRODUCT_IMAGE,
      entityType: EntityType.PRODUCT_SUPPLIER,
      entityId: `${productId}-${supplierId}`, // You may need to adjust this
      isPublic: true,
      accessLevel: 'PUBLIC',
      metadata: {
        productId,
        supplierId,
        ...metadata,
      },
    };

    return this.documentsService.uploadDocument(file, uploadDto, req.user.id);
  }

  @Get('products/:productId/suppliers/:supplierId/image')
  @ApiOperation({ summary: 'Get product image for specific supplier' })
  async getProductImage(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
    @Request() req: AuthenticatedRequest
  ) {
    const filters: DocumentFiltersDto = {
      documentType: DocumentType.PRODUCT_IMAGE,
      entityType: EntityType.PRODUCT_SUPPLIER,
      entityId: `${productId}-${supplierId}`,
      limit: 1,
    };

    const result = await this.documentsService.getDocuments(filters, req.user.id);
    return result.data[0] || null;
  }

  // Product certification endpoints

  @Post('products/:productId/suppliers/:supplierId/certification')
  @ApiOperation({ summary: 'Upload certification document for product-supplier combination' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductCertification(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    certificationData: {
      title: string;
      certificationType: string;
      issuer?: string;
      validFrom?: string;
      validUntil?: string;
      certificateNumber?: string;
      description?: string;
    },
    @Request() req: AuthenticatedRequest
  ): Promise<Document> {
    if (!file) {
      throw new BadRequestException('No certification file provided');
    }

    // Map certification type to document type
    const documentTypeMap = {
      quality: 'PRODUCT_QUALITY_CERTIFICATE',
      safety: 'PRODUCT_SAFETY_CERTIFICATE',
      compliance: 'PRODUCT_COMPLIANCE_CERTIFICATE',
      specification: 'PRODUCT_SPECIFICATION_SHEET',
      material: 'PRODUCT_MATERIAL_CERTIFICATE',
      test: 'PRODUCT_TEST_REPORT',
    };

    const documentType = documentTypeMap[certificationData.certificationType] || 'PRODUCT_QUALITY_CERTIFICATE';

    const uploadDto: UploadDocumentDto = {
      title: certificationData.title,
      description: certificationData.description,
      documentType: documentType as DocumentType,
      entityType: EntityType.PRODUCT_SUPPLIER,
      entityId: `${productId}-${supplierId}`,
      isPublic: false,
      accessLevel: 'INTERNAL',
      metadata: {
        productId,
        supplierId,
        issuer: certificationData.issuer,
        validFrom: certificationData.validFrom,
        validUntil: certificationData.validUntil,
        certificateNumber: certificationData.certificateNumber,
        certificationType: certificationData.certificationType,
      },
    };

    return this.documentsService.uploadDocument(file, uploadDto, req.user.id);
  }

  @Get('products/:productId/suppliers/:supplierId/certifications')
  @ApiOperation({ summary: 'Get all certifications for product-supplier combination' })
  async getProductCertifications(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
    @Query() filters: Omit<DocumentFiltersDto, 'entityType' | 'entityId' | 'documentType'>,
    @Request() req: AuthenticatedRequest
  ) {
    const fullFilters: DocumentFiltersDto = {
      ...filters,
      entityType: EntityType.PRODUCT_SUPPLIER,
      entityId: `${productId}-${supplierId}`,
      // Filter for certification document types
      documentType: undefined, // Will be filtered in the query
    };

    // Get all certifications for this product-supplier
    const result = await this.documentsService.getDocuments(fullFilters, req.user.id);

    // Filter for only certification types
    const certificationTypes = [
      'PRODUCT_QUALITY_CERTIFICATE',
      'PRODUCT_SAFETY_CERTIFICATE',
      'PRODUCT_COMPLIANCE_CERTIFICATE',
      'PRODUCT_SPECIFICATION_SHEET',
      'PRODUCT_MATERIAL_CERTIFICATE',
      'PRODUCT_TEST_REPORT',
    ];

    result.data = result.data.filter(doc => certificationTypes.includes(doc.documentType));

    return result;
  }

  // Discrepancy photo endpoints

  @Post('discrepancies/delivery/:deliveryId/upload')
  @ApiOperation({ summary: 'Upload delivery discrepancy photo' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadDeliveryDiscrepancyPhoto(
    @Param('deliveryId', ParseUUIDPipe) deliveryId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    discrepancyData: {
      title: string;
      description?: string;
      severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      reportedBy?: string;
      location?: string;
    },
    @Request() req: AuthenticatedRequest
  ): Promise<Document> {
    if (!file) {
      throw new BadRequestException('No photo provided');
    }

    const uploadDto: UploadDocumentDto = {
      title: discrepancyData.title,
      description: discrepancyData.description,
      documentType: DocumentType.DELIVERY_DISCREPANCY_PHOTO,
      entityType: EntityType.DELIVERY,
      entityId: deliveryId,
      isPublic: false,
      accessLevel: 'RESTRICTED', // Higher security for discrepancies
      metadata: {
        deliveryId,
        severity: discrepancyData.severity || 'MEDIUM',
        reportedBy: discrepancyData.reportedBy || req.user.email,
        location: discrepancyData.location,
        reportedAt: new Date().toISOString(),
        requiresAction: true,
      },
    };

    return this.documentsService.uploadDocument(file, uploadDto, req.user.id);
  }

  @Post('discrepancies/product/:orderProductId/upload')
  @ApiOperation({ summary: 'Upload product discrepancy photo' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadProductDiscrepancyPhoto(
    @Param('orderProductId', ParseUUIDPipe) orderProductId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    discrepancyData: {
      title: string;
      description?: string;
      discrepancyType: 'QUALITY_ISSUE' | 'DAMAGE' | 'NON_CONFORMITY';
      severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      reportedBy?: string;
    },
    @Request() req: AuthenticatedRequest
  ): Promise<Document> {
    if (!file) {
      throw new BadRequestException('No photo provided');
    }

    // Map discrepancy type to document type
    const documentTypeMap = {
      QUALITY_ISSUE: 'QUALITY_ISSUE_PHOTO',
      DAMAGE: 'DAMAGE_REPORT_PHOTO',
      NON_CONFORMITY: 'NON_CONFORMITY_PHOTO',
    };

    const documentType = documentTypeMap[discrepancyData.discrepancyType] || 'PRODUCT_DISCREPANCY_PHOTO';

    const uploadDto: UploadDocumentDto = {
      title: discrepancyData.title,
      description: discrepancyData.description,
      documentType: documentType as DocumentType,
      entityType: EntityType.ORDER_PRODUCT,
      entityId: orderProductId,
      isPublic: false,
      accessLevel: 'RESTRICTED',
      metadata: {
        orderProductId,
        discrepancyType: discrepancyData.discrepancyType,
        severity: discrepancyData.severity || 'MEDIUM',
        reportedBy: discrepancyData.reportedBy || req.user.email,
        reportedAt: new Date().toISOString(),
        requiresAction: true,
      },
    };

    return this.documentsService.uploadDocument(file, uploadDto, req.user.id);
  }

  @Get('discrepancies/urgent')
  @ApiOperation({ summary: 'Get urgent discrepancy photos requiring attention' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  async getUrgentDiscrepancies(@Request() req: AuthenticatedRequest) {
    return this.documentsService.getUrgentDiscrepancies(req.user.id);
  }

  @Get('discrepancies/:entityType/:entityId')
  @ApiOperation({ summary: 'Get all discrepancy photos for an entity' })
  async getEntityDiscrepancies(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Query() filters: Omit<DocumentFiltersDto, 'entityType' | 'entityId'>,
    @Request() req: AuthenticatedRequest
  ) {
    const fullFilters: DocumentFiltersDto = {
      ...filters,
      entityType: entityType as EntityType,
      entityId,
    };

    const result = await this.documentsService.getDocuments(fullFilters, req.user.id);

    // Filter for only discrepancy types (including post-delivery)
    const discrepancyTypes = [
      'DELIVERY_DISCREPANCY_PHOTO',
      'PRODUCT_DISCREPANCY_PHOTO',
      'QUALITY_ISSUE_PHOTO',
      'DAMAGE_REPORT_PHOTO',
      'NON_CONFORMITY_PHOTO',
      'POST_DELIVERY_DAMAGE_PHOTO',
      'POST_DELIVERY_QUALITY_ISSUE_PHOTO',
      'POST_DELIVERY_MISSING_ITEMS_PHOTO',
      'POST_DELIVERY_WRONG_ITEMS_PHOTO',
      'POST_DELIVERY_CONTAMINATION_PHOTO',
      'POST_DELIVERY_SPOILAGE_PHOTO',
      'CUSTOMER_COMPLAINT_PHOTO',
    ];

    result.data = result.data.filter(doc => discrepancyTypes.includes(doc.documentType));

    return result;
  }

  @Post('discrepancies/post-delivery/:orderId/upload')
  @ApiOperation({ summary: 'Upload post-delivery discrepancy photo' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPostDeliveryDiscrepancyPhoto(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    discrepancyData: {
      title: string;
      description?: string;
      discrepancyType:
        | 'DAMAGE'
        | 'QUALITY_ISSUE'
        | 'MISSING_ITEMS'
        | 'WRONG_ITEMS'
        | 'CONTAMINATION'
        | 'SPOILAGE'
        | 'CUSTOMER_COMPLAINT';
      severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      discoveredDate?: string; // When the issue was discovered post-delivery
      affectedQuantity?: number;
      customerReported?: boolean;
      customerComplaintId?: string;
      reportedBy?: string;
    },
    @Request() req: AuthenticatedRequest
  ): Promise<Document> {
    if (!file) {
      throw new BadRequestException('No photo provided');
    }

    // Map discrepancy type to document type
    const documentTypeMap = {
      DAMAGE: 'POST_DELIVERY_DAMAGE_PHOTO',
      QUALITY_ISSUE: 'POST_DELIVERY_QUALITY_ISSUE_PHOTO',
      MISSING_ITEMS: 'POST_DELIVERY_MISSING_ITEMS_PHOTO',
      WRONG_ITEMS: 'POST_DELIVERY_WRONG_ITEMS_PHOTO',
      CONTAMINATION: 'POST_DELIVERY_CONTAMINATION_PHOTO',
      SPOILAGE: 'POST_DELIVERY_SPOILAGE_PHOTO',
      CUSTOMER_COMPLAINT: 'CUSTOMER_COMPLAINT_PHOTO',
    };

    const documentType = documentTypeMap[discrepancyData.discrepancyType] || 'POST_DELIVERY_DAMAGE_PHOTO';

    const uploadDto: UploadDocumentDto = {
      title: discrepancyData.title,
      description: discrepancyData.description,
      documentType: documentType as DocumentType,
      entityType: EntityType.PURCHASE_ORDER, // Post-delivery issues are typically linked to orders
      entityId: orderId,
      isPublic: false,
      accessLevel: 'RESTRICTED', // Higher security for post-delivery discrepancies
      metadata: {
        orderId,
        discrepancyType: discrepancyData.discrepancyType,
        severity: discrepancyData.severity || 'MEDIUM',
        discoveredDate: discrepancyData.discoveredDate || new Date().toISOString(),
        affectedQuantity: discrepancyData.affectedQuantity,
        customerReported: discrepancyData.customerReported || false,
        customerComplaintId: discrepancyData.customerComplaintId,
        reportedBy: discrepancyData.reportedBy || req.user.email,
        reportedAt: new Date().toISOString(),
        isPostDelivery: true,
        requiresAction: true,
        // Calculate days since delivery for tracking
        daysSinceDelivery: discrepancyData.discoveredDate
          ? Math.floor(
              (new Date().getTime() - new Date(discrepancyData.discoveredDate).getTime()) / (1000 * 60 * 60 * 24)
            )
          : 0,
      },
    };

    return this.documentsService.uploadDocument(file, uploadDto, req.user.id);
  }

  @Get('discrepancies/post-delivery')
  @ApiOperation({ summary: 'Get post-delivery discrepancy photos' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  async getPostDeliveryDiscrepancies(@Query('days') days: number = 7, @Request() req: AuthenticatedRequest) {
    return this.documentsService.getPostDeliveryDiscrepancies(req.user.id, days);
  }

  @Get('discrepancies/timeline/:timeline')
  @ApiOperation({ summary: 'Get discrepancies by timeline (delivery, post-delivery, or all)' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  async getDiscrepanciesByTimeline(
    @Param('timeline') timeline: 'delivery' | 'post-delivery' | 'all',
    @Request() req: AuthenticatedRequest
  ) {
    return this.documentsService.getDiscrepanciesByTimeline(req.user.id, timeline);
  }

  // Certification expiration monitoring

  @Get('certifications/expiring')
  @ApiOperation({ summary: 'Get certifications expiring within specified days' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getExpiringCertifications(@Query('days') days: number = 30, @Request() req: AuthenticatedRequest) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const filters: DocumentFiltersDto = {
      page: 1,
      limit: 100,
      sortBy: 'metadata',
      sortOrder: 'ASC',
    };

    const result = await this.documentsService.getDocuments(filters, req.user.id);

    // Filter for certifications with expiring dates
    return result.data.filter(doc => {
      const isCertification = doc.isCertification || doc.isProductCertification;
      if (!isCertification || !doc.metadata?.validUntil) return false;

      const validUntil = new Date(doc.metadata.validUntil);
      return validUntil <= expiryDate && validUntil >= new Date();
    });
  }

  // Report generation endpoints

  @Post('reports/generate')
  @ApiOperation({ summary: 'Generate and store a report' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async generateReport(
    @Body()
    _reportConfig: {
      reportType: string;
      parameters: Record<string, unknown>;
      title: string;
      description?: string;
    },
    @Request() _req: AuthenticatedRequest
  ) {
    // This would integrate with a report generation service
    // For now, return a placeholder
    return {
      message: 'Report generation initiated',
      reportId: 'generated-report-id',
    };
  }
}
