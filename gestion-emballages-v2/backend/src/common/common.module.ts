import { Module, Global } from '@nestjs/common';
import { MinioService } from './services/minio.service';
import { PaginationService } from './services/pagination.service';

@Global()
@Module({
  providers: [MinioService, PaginationService],
  exports: [MinioService, PaginationService],
})
export class CommonModule {}