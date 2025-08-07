import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformsService } from './platforms.service';
import { PlatformsController } from './platforms.controller';
import { Platform } from './entities/platform.entity';
import { PlatformSite } from './entities/platform-site.entity';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Platform, PlatformSite]),
    CommonModule,
  ],
  controllers: [PlatformsController],
  providers: [PlatformsService],
  exports: [PlatformsService],
})
export class PlatformsModule {}