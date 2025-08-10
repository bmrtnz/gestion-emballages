import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentStorageService } from './services/document-storage.service';

import { Document } from './entities/document.entity';
import { DocumentAccess } from './entities/document-access.entity';

import { PaginationService } from '@common/services/pagination.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, DocumentAccess]),

    // Configure Multer for file uploads
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (_configService: ConfigService) => ({
        limits: {
          fileSize: 50 * 1024 * 1024, // 50MB limit
          files: 10, // Max 10 files per request
        },
        fileFilter: (req, file, callback) => {
          // Basic file type validation
          const allowedMimes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
          ];

          if (allowedMimes.includes(file.mimetype)) {
            callback(null, true);
          } else {
            callback(new Error(`File type ${file.mimetype} not allowed`), false);
          }
        },
      }),
      inject: [ConfigService],
    }),

    ConfigModule,
  ],

  controllers: [DocumentsController],

  providers: [DocumentsService, DocumentStorageService, PaginationService],

  exports: [DocumentsService, DocumentStorageService],
})
export class DocumentsModule {}
