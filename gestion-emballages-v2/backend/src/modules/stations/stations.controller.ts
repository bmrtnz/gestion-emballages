import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { StationsService } from './stations.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';

@ApiTags('Stations')
@Controller('stations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get all active stations for selection' })
  @ApiResponse({ status: 200, description: 'Active stations retrieved successfully' })
  async findActiveStations() {
    return this.stationsService.findActiveStations();
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Create a new station' })
  @ApiResponse({ status: 201, description: 'Station created successfully' })
  async create(@Body() createStationDto: CreateStationDto, @Request() req) {
    const stationData = {
      ...createStationDto,
      createdById: req.user.id,
    };
    return this.stationsService.create(stationData);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Get all stations with pagination' })
  @ApiResponse({ status: 200, description: 'Stations retrieved successfully' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.stationsService.findAll(paginationDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Get station by ID' })
  @ApiResponse({ status: 200, description: 'Station retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.stationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Update station' })
  @ApiResponse({ status: 200, description: 'Station updated successfully' })
  async update(@Param('id') id: string, @Body() updateStationDto: UpdateStationDto, @Request() req) {
    const stationData = {
      ...updateStationDto,
      updatedById: req.user.id,
    };
    return this.stationsService.update(id, stationData);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Deactivate station' })
  @ApiResponse({ status: 200, description: 'Station deactivated successfully' })
  async remove(@Param('id') id: string) {
    return this.stationsService.remove(id);
  }

  @Patch(':id/reactivate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Reactivate station' })
  @ApiResponse({ status: 200, description: 'Station reactivated successfully' })
  async reactivate(@Param('id') id: string) {
    return this.stationsService.reactivate(id);
  }
}
