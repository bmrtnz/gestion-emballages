import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    try {
      // Parse environment variables with proper type conversion
      const endpoint = this.configService.get<string>('MINIO_ENDPOINT') || 'localhost';
      const port = parseInt(this.configService.get<string>('MINIO_PORT') || '9000', 10);
      const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';
      const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY') || 'devuser';
      const secretKey = this.configService.get<string>('MINIO_SECRET_KEY') || 'devpassword123';

      console.log('MinIO Config:', { endpoint, port, useSSL, accessKey: accessKey.substring(0, 3) + '***' });

      this.minioClient = new Minio.Client({
        endPoint: endpoint,
        port: port,
        useSSL: useSSL,
        accessKey: accessKey,
        secretKey: secretKey,
      });

      this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME') || 'gestion-emballages-dev';
      console.log('MinIO service initialized successfully');
    } catch (error) {
      console.error('MinIO service initialization failed:', error.message);
      // Create a dummy client to prevent app crashes
      this.minioClient = null;
      this.bucketName = 'default';
    }
  }

  private async ensureBucket() {
    if (!this.minioClient) {
      console.warn('MinIO client not available');
      return;
    }

    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      }
    } catch (error) {
      console.warn('MinIO bucket initialization failed:', error.message);
      // Don't throw error, allow service to start without MinIO
    }
  }

  async uploadFile(objectName: string, buffer: Buffer, contentType: string): Promise<string> {
    if (!this.minioClient) {
      console.warn('MinIO not available, file upload skipped');
      throw new Error('File storage service not available');
    }

    try {
      await this.ensureBucket();
      await this.minioClient.putObject(this.bucketName, objectName, buffer, buffer.length, {
        'Content-Type': contentType,
      });

      return objectName;
    } catch (error) {
      console.error('MinIO upload failed:', error.message);
      throw new Error('File upload failed');
    }
  }

  async getFileUrl(objectName: string): Promise<string> {
    if (!this.minioClient) {
      console.warn('MinIO not available, returning placeholder URL');
      return `/placeholder/${objectName}`;
    }

    try {
      return await this.minioClient.presignedGetObject(
        this.bucketName,
        objectName,
        24 * 60 * 60 // 24 hours
      );
    } catch (error) {
      console.error('MinIO getFileUrl failed:', error.message);
      return `/placeholder/${objectName}`;
    }
  }

  async deleteFile(objectName: string): Promise<void> {
    if (!this.minioClient) {
      console.warn('MinIO not available, file deletion skipped');
      return;
    }

    try {
      await this.minioClient.removeObject(this.bucketName, objectName);
    } catch (error) {
      console.error('MinIO delete failed:', error.message);
    }
  }

  async listFiles(prefix: string): Promise<Minio.BucketItem[]> {
    if (!this.minioClient) {
      console.warn('MinIO not available, returning empty file list');
      return [];
    }

    try {
      const objectsList = [];
      const stream = this.minioClient.listObjects(this.bucketName, prefix);

      return new Promise((resolve, reject) => {
        stream.on('data', obj => objectsList.push(obj));
        stream.on('error', err => reject(err));
        stream.on('end', () => resolve(objectsList));
      });
    } catch (error) {
      console.error('MinIO listFiles failed:', error.message);
      return [];
    }
  }
}
