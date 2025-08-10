import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { DocumentType, EntityType } from '../entities/document.entity';

// Interfaces for MinIO responses
interface FileInfo {
  size: number;
  etag: string;
  lastModified: Date;
  metaData: Record<string, string>;
}

interface FileItem {
  name: string;
  lastModified: Date;
  size: number;
  etag: string;
}

@Injectable()
export class DocumentStorageService {
  private readonly logger = new Logger(DocumentStorageService.name);
  private minioClient: Minio.Client;

  // MinIO Bucket Structure
  private readonly buckets = {
    // Product images - publicly accessible for catalog
    'product-images': {
      public: true,
      path: 'products/{productId}/suppliers/{supplierId}/',
    },

    // Certification documents - restricted access
    certifications: {
      public: false,
      path: '{entityType}/{entityId}/certifications/',
    },

    // Product certifications - per supplier
    'product-certifications': {
      public: false,
      path: 'products/{productId}/suppliers/{supplierId}/certifications/',
    },

    // Discrepancy photos - urgent attention bucket
    discrepancies: {
      public: false,
      path: '{entityType}/{entityId}/discrepancies/{discrepancyType}/',
    },

    // Generated business documents - internal access
    documents: {
      public: false,
      path: '{entityType}/{entityId}/{documentType}/',
    },

    // Reports and exports - time-limited access
    reports: {
      public: false,
      path: 'reports/{year}/{month}/',
    },

    // Temporary uploads and processing
    temp: {
      public: false,
      path: 'temp/{userId}/',
    },
  } as const;

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT') || 'localhost',
      port: parseInt(this.configService.get('MINIO_PORT')) || 9000,
      useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY') || 'minioadmin',
      secretKey: this.configService.get('MINIO_SECRET_KEY') || 'minioadmin',
    });

    this.initializeBuckets();
  }

  private async initializeBuckets(): Promise<void> {
    try {
      for (const bucketName of Object.keys(this.buckets)) {
        const exists = await this.minioClient.bucketExists(bucketName);
        if (!exists) {
          await this.minioClient.makeBucket(bucketName);
          this.logger.log(`Created MinIO bucket: ${bucketName}`);

          // Set bucket policy for public buckets
          if (this.buckets[bucketName].public) {
            await this.setPublicReadPolicy(bucketName);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error initializing MinIO buckets:', error);
    }
  }

  private async setPublicReadPolicy(bucketName: string): Promise<void> {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };

    await this.minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
  }

  /**
   * Determines the appropriate bucket and path for a document
   */
  getBucketInfo(
    documentType: DocumentType,
    _entityType: EntityType
  ): {
    bucket: string;
    pathTemplate: string;
    isPublic: boolean;
  } {
    switch (documentType) {
      case DocumentType.PRODUCT_IMAGE:
        return {
          bucket: 'product-images',
          pathTemplate: this.buckets['product-images'].path,
          isPublic: true,
        };

      case DocumentType.PLATFORM_CERTIFICATION:
      case DocumentType.SUPPLIER_CERTIFICATION:
      case DocumentType.STATION_CERTIFICATION:
      case DocumentType.QUALITY_CERTIFICATE:
      case DocumentType.SAFETY_CERTIFICATE:
        return {
          bucket: 'certifications',
          pathTemplate: this.buckets['certifications'].path,
          isPublic: false,
        };

      // Product-level certifications
      case DocumentType.PRODUCT_QUALITY_CERTIFICATE:
      case DocumentType.PRODUCT_SAFETY_CERTIFICATE:
      case DocumentType.PRODUCT_COMPLIANCE_CERTIFICATE:
      case DocumentType.PRODUCT_SPECIFICATION_SHEET:
      case DocumentType.PRODUCT_MATERIAL_CERTIFICATE:
      case DocumentType.PRODUCT_TEST_REPORT:
        return {
          bucket: 'product-certifications',
          pathTemplate: this.buckets['product-certifications'].path,
          isPublic: false,
        };

      // Discrepancy photos (delivery-time and post-delivery)
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
        return {
          bucket: 'discrepancies',
          pathTemplate: this.buckets['discrepancies'].path,
          isPublic: false,
        };

      case DocumentType.STOCK_REPORT:
      case DocumentType.SALES_REPORT:
      case DocumentType.PLATFORM_REPORT:
        return {
          bucket: 'reports',
          pathTemplate: this.buckets['reports'].path,
          isPublic: false,
        };

      default:
        return {
          bucket: 'documents',
          pathTemplate: this.buckets['documents'].path,
          isPublic: false,
        };
    }
  }

  /**
   * Generates a structured file path based on document type and entity
   */
  generateFilePath(
    documentType: DocumentType,
    entityType: EntityType,
    entityId: string,
    fileName: string,
    additionalParams: Record<string, string> = {}
  ): string {
    const bucketInfo = this.getBucketInfo(documentType, entityType);
    let path = bucketInfo.pathTemplate;

    // Replace common path variables
    path = path.replace('{entityType}', entityType.toLowerCase());
    path = path.replace('{entityId}', entityId);
    path = path.replace('{documentType}', documentType.toLowerCase());

    // Handle discrepancy type for discrepancy photos
    if (bucketInfo.bucket === 'discrepancies') {
      const discrepancyType = this.getDiscrepancyTypeFromDocumentType(documentType);
      path = path.replace('{discrepancyType}', discrepancyType);
    }

    // For reports, use current date
    if (documentType.includes('REPORT')) {
      const now = new Date();
      path = path.replace('{year}', now.getFullYear().toString());
      path = path.replace('{month}', (now.getMonth() + 1).toString().padStart(2, '0'));
    }

    // Replace any additional parameters
    Object.entries(additionalParams).forEach(([key, value]) => {
      path = path.replace(`{${key}}`, value);
    });

    // Add timestamp to avoid filename collisions
    const timestamp = Date.now();
    const fileExtension = fileName.split('.').pop();
    const baseName = fileName.replace(`.${fileExtension}`, '');
    const uniqueFileName = `${baseName}_${timestamp}.${fileExtension}`;

    return path + uniqueFileName;
  }

  /**
   * Upload a file to MinIO
   */
  async uploadFile(
    bucketName: string,
    filePath: string,
    fileBuffer: Buffer,
    mimeType: string,
    metadata?: Record<string, string>
  ): Promise<void> {
    try {
      const uploadMetadata = {
        'Content-Type': mimeType,
        ...metadata,
      };

      await this.minioClient.putObject(bucketName, filePath, fileBuffer, fileBuffer.length, uploadMetadata);

      this.logger.log(`File uploaded successfully: ${bucketName}/${filePath}`);
    } catch (error) {
      this.logger.error(`Error uploading file to MinIO:`, error);
      throw error;
    }
  }

  /**
   * Generate a presigned URL for file access
   */
  async getPresignedUrl(
    bucketName: string,
    filePath: string,
    expiry: number = 3600 // 1 hour default
  ): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(bucketName, filePath, expiry);
    } catch (error) {
      this.logger.error(`Error generating presigned URL:`, error);
      throw error;
    }
  }

  /**
   * Get file metadata
   */
  async getFileInfo(bucketName: string, filePath: string): Promise<FileInfo> {
    try {
      return await this.minioClient.statObject(bucketName, filePath);
    } catch (error) {
      this.logger.error(`Error getting file info:`, error);
      throw error;
    }
  }

  /**
   * Delete a file from MinIO
   */
  async deleteFile(bucketName: string, filePath: string): Promise<void> {
    try {
      await this.minioClient.removeObject(bucketName, filePath);
      this.logger.log(`File deleted successfully: ${bucketName}/${filePath}`);
    } catch (error) {
      this.logger.error(`Error deleting file from MinIO:`, error);
      throw error;
    }
  }

  /**
   * Copy a file within MinIO (for versioning)
   */
  async copyFile(sourceBucket: string, sourcePath: string, destBucket: string, destPath: string): Promise<void> {
    try {
      await this.minioClient.copyObject(destBucket, destPath, `/${sourceBucket}/${sourcePath}`, null);
      this.logger.log(`File copied: ${sourceBucket}/${sourcePath} → ${destBucket}/${destPath}`);
    } catch (error) {
      this.logger.error(`Error copying file:`, error);
      throw error;
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(bucketName: string, prefix: string = ''): Promise<FileItem[]> {
    try {
      const files: FileItem[] = [];
      const stream = this.minioClient.listObjects(bucketName, prefix, true);

      return new Promise((resolve, reject) => {
        stream.on('data', obj => files.push(obj));
        stream.on('error', reject);
        stream.on('end', () => resolve(files));
      });
    } catch (error) {
      this.logger.error(`Error listing files:`, error);
      throw error;
    }
  }

  /**
   * Get public URL for public buckets
   */
  getPublicUrl(bucketName: string, filePath: string): string {
    const endpoint = this.configService.get('MINIO_ENDPOINT') || 'localhost';
    const port = this.configService.get('MINIO_PORT') || '9000';
    const useSSL = this.configService.get('MINIO_USE_SSL') === 'true';

    const protocol = useSSL ? 'https' : 'http';
    const portSuffix = (useSSL && port === '443') || (!useSSL && port === '80') ? '' : `:${port}`;

    return `${protocol}://${endpoint}${portSuffix}/${bucketName}/${filePath}`;
  }

  /**
   * Get discrepancy type from document type
   */
  private getDiscrepancyTypeFromDocumentType(documentType: DocumentType): string {
    switch (documentType) {
      // Delivery-time discrepancies
      case DocumentType.DELIVERY_DISCREPANCY_PHOTO:
        return 'delivery';
      case DocumentType.PRODUCT_DISCREPANCY_PHOTO:
        return 'product';
      case DocumentType.QUALITY_ISSUE_PHOTO:
        return 'quality';
      case DocumentType.DAMAGE_REPORT_PHOTO:
        return 'damage';
      case DocumentType.NON_CONFORMITY_PHOTO:
        return 'non-conformity';

      // Post-delivery discrepancies
      case DocumentType.POST_DELIVERY_DAMAGE_PHOTO:
        return 'post-delivery-damage';
      case DocumentType.POST_DELIVERY_QUALITY_ISSUE_PHOTO:
        return 'post-delivery-quality';
      case DocumentType.POST_DELIVERY_MISSING_ITEMS_PHOTO:
        return 'post-delivery-missing';
      case DocumentType.POST_DELIVERY_WRONG_ITEMS_PHOTO:
        return 'post-delivery-wrong-items';
      case DocumentType.POST_DELIVERY_CONTAMINATION_PHOTO:
        return 'post-delivery-contamination';
      case DocumentType.POST_DELIVERY_SPOILAGE_PHOTO:
        return 'post-delivery-spoilage';
      case DocumentType.CUSTOMER_COMPLAINT_PHOTO:
        return 'customer-complaint';

      default:
        return 'general';
    }
  }

  /**
   * Cleanup old temporary files
   */
  async cleanupTempFiles(olderThanHours: number = 24): Promise<void> {
    try {
      const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
      const tempFiles = await this.listFiles('temp');

      for (const file of tempFiles) {
        if (file.lastModified < cutoffTime) {
          await this.deleteFile('temp', file.name);
          this.logger.log(`Cleaned up temp file: ${file.name}`);
        }
      }
    } catch (error) {
      this.logger.error('Error cleaning up temp files:', error);
    }
  }

  /**
   * Get urgent discrepancy photos that need attention
   */
  async getUrgentDiscrepancyFiles(bucketName: string = 'discrepancies'): Promise<FileItem[]> {
    try {
      const files = await this.listFiles(bucketName);
      const urgentCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

      return files.filter(
        file =>
          file.lastModified > urgentCutoff &&
          (file.name.includes('delivery') || file.name.includes('quality') || file.name.includes('damage'))
      );
    } catch (error) {
      this.logger.error('Error getting urgent discrepancy files:', error);
      return [];
    }
  }
}
