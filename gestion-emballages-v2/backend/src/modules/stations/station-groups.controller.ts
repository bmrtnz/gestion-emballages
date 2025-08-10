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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { StationGroupsService } from './station-groups.service';
import { CreateStationGroupDto } from './dto/create-station-group.dto';
import { UpdateStationGroupDto } from './dto/update-station-group.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';

@ApiTags('Station Groups')
@Controller('station-groups')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class StationGroupsController {
  constructor(private readonly stationGroupsService: StationGroupsService) {}

  @Get('statistics')
  @ApiOperation({ summary: 'Get station group statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics() {
    return this.stationGroupsService.getStationStatistics();
  }

  @Get('independent-stations')
  @ApiOperation({ summary: 'Get all independent stations (not in any group)' })
  @ApiResponse({ status: 200, description: 'Independent stations retrieved successfully' })
  async getIndependentStations() {
    return this.stationGroupsService.getIndependentStations();
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new station group' })
  @ApiResponse({ status: 201, description: 'Station group created successfully' })
  async create(@Body() createStationGroupDto: CreateStationGroupDto) {
    return this.stationGroupsService.create(createStationGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all station groups with pagination' })
  @ApiResponse({ status: 200, description: 'Station groups retrieved successfully' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.stationGroupsService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get station group by ID' })
  @ApiResponse({ status: 200, description: 'Station group retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.stationGroupsService.findOne(id);
  }

  @Get(':id/stations')
  @ApiOperation({ summary: 'Get all stations in a group' })
  @ApiResponse({ status: 200, description: 'Stations retrieved successfully' })
  async getStationsInGroup(@Param('id') id: string) {
    return this.stationGroupsService.getStationsInGroup(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update station group' })
  @ApiResponse({ status: 200, description: 'Station group updated successfully' })
  async update(@Param('id') id: string, @Body() updateStationGroupDto: UpdateStationGroupDto) {
    return this.stationGroupsService.update(id, updateStationGroupDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Deactivate station group and all its stations' })
  @ApiResponse({ status: 200, description: 'Station group deactivated successfully' })
  async remove(@Param('id') id: string) {
    return this.stationGroupsService.remove(id);
  }

  @Patch(':id/reactivate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Reactivate station group' })
  @ApiResponse({ status: 200, description: 'Station group reactivated successfully' })
  async reactivate(@Param('id') id: string) {
    return this.stationGroupsService.reactivate(id);
  }
}
