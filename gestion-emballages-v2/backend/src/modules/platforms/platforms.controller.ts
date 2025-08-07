import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { PlatformsService } from './platforms.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { CreatePlatformSiteDto } from './dto/create-platform-site.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';
import { PaginationDto } from '@common/dto/pagination.dto';

@Controller('platforms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlatformsController {
  constructor(private readonly platformsService: PlatformsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.GESTIONNAIRE)
  async create(@Body() createPlatformDto: CreatePlatformDto, @Request() req) {
    const platform = await this.platformsService.create(createPlatformDto, req.user.id);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Plateforme créée avec succès',
      data: platform,
    };
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.platformsService.findAll(paginationDto);
  }

  @Get('active')
  async findActive() {
    const platforms = await this.platformsService.findActivePlatforms();
    return {
      statusCode: HttpStatus.OK,
      data: platforms,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const platform = await this.platformsService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      data: platform,
    };
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.GESTIONNAIRE)
  async update(
    @Param('id') id: string,
    @Body() updatePlatformDto: UpdatePlatformDto,
    @Request() req,
  ) {
    const platform = await this.platformsService.update(id, updatePlatformDto, req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Plateforme mise à jour avec succès',
      data: platform,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.GESTIONNAIRE)
  async remove(@Param('id') id: string, @Request() req) {
    await this.platformsService.remove(id, req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Plateforme désactivée avec succès',
    };
  }

  // Platform sites management
  @Post(':id/sites')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.GESTIONNAIRE)
  async createSite(
    @Param('id') platformId: string,
    @Body() createSiteDto: CreatePlatformSiteDto,
  ) {
    const site = await this.platformsService.createSite(platformId, createSiteDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Site créé avec succès',
      data: site,
    };
  }

  @Patch(':id/sites/:siteId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.GESTIONNAIRE)
  async updateSite(
    @Param('id') platformId: string,
    @Param('siteId') siteId: string,
    @Body() updateSiteDto: CreatePlatformSiteDto,
  ) {
    const site = await this.platformsService.updateSite(platformId, siteId, updateSiteDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Site mis à jour avec succès',
      data: site,
    };
  }

  @Delete(':id/sites/:siteId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.GESTIONNAIRE)
  async removeSite(
    @Param('id') platformId: string,
    @Param('siteId') siteId: string,
  ) {
    await this.platformsService.removeSite(platformId, siteId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Site désactivé avec succès',
    };
  }
}