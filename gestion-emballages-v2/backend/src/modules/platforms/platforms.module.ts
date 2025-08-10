import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformsService } from './platforms.service';
import { PlatformContactsService } from './platform-contacts.service';
import { PlatformsController } from './platforms.controller';
import { PlatformContactsController } from './platform-contacts.controller';
import { Platform } from './entities/platform.entity';
import { PlatformContact } from './entities/platform-contact.entity';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Platform, PlatformContact]), CommonModule],
  controllers: [PlatformsController, PlatformContactsController],
  providers: [PlatformsService, PlatformContactsService],
  exports: [PlatformsService, PlatformContactsService],
})
export class PlatformsModule {}
