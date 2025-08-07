import { Module, Global } from '@nestjs/common';
import { MinioService } from './services/minio.service';
import { PaginationService } from './services/pagination.service';
import { EmailService } from './services/email.service';

@Global()
@Module({
  providers: [MinioService, PaginationService, EmailService],
  exports: [MinioService, PaginationService, EmailService],
})
export class CommonModule {}