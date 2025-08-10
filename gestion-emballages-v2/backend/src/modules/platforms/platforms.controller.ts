import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PlatformsService } from './platforms.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
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
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
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
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  async update(@Param('id') id: string, @Body() updatePlatformDto: UpdatePlatformDto, @Request() req) {
    const platform = await this.platformsService.update(id, updatePlatformDto, req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Plateforme mise à jour avec succès',
      data: platform,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  async remove(@Param('id') id: string, @Request() req) {
    await this.platformsService.remove(id, req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Plateforme désactivée avec succès',
    };
  }

  // Platform sites management
  // PlatformSite methods removed - use PlatformContacts instead
  // @Post(':id/sites')
  // @Patch(':id/sites/:siteId')
  // @Delete(':id/sites/:siteId')
}
