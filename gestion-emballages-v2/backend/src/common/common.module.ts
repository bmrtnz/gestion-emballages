import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinioService } from './services/minio.service';
import { PaginationService } from './services/pagination.service';
import { EmailService } from './services/email.service';
import { HistoryService } from './services/history.service';
import { EntityEventService } from './services/entity-event.service';
import { EntityHistory } from './entities/entity-history.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([EntityHistory])],
  providers: [MinioService, PaginationService, EmailService, HistoryService, EntityEventService],
  exports: [MinioService, PaginationService, EmailService, HistoryService, EntityEventService],
})
export class CommonModule {}
