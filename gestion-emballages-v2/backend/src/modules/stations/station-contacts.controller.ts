import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { StationContactsService } from './station-contacts.service';
import { CreateStationContactDto } from './dto/create-station-contact.dto';
import { UpdateStationContactDto } from './dto/update-station-contact.dto';
import { StationContact } from './entities/station-contact.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';

@ApiTags('Station Contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/station-contacts')
export class StationContactsController {
  constructor(private readonly stationContactsService: StationContactsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new station contact' })
  @ApiResponse({ status: 201, description: 'Contact successfully created', type: StationContact })
  @ApiResponse({ status: 400, description: 'Validation error or business rule violation' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  create(@Body() createStationContactDto: CreateStationContactDto): Promise<StationContact> {
    return this.stationContactsService.create(createStationContactDto);
  }

  @Get('station/:stationId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get all contacts for a station' })
  @ApiParam({ name: 'stationId', description: 'Station ID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'List of station contacts', type: [StationContact] })
  findByStation(@Param('stationId', ParseUUIDPipe) stationId: string): Promise<StationContact[]> {
    return this.stationContactsService.findByStation(stationId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get a station contact by ID' })
  @ApiParam({ name: 'id', description: 'Contact ID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Station contact details', type: StationContact })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<StationContact> {
    return this.stationContactsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update a station contact' })
  @ApiParam({ name: 'id', description: 'Contact ID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Contact successfully updated', type: StationContact })
  @ApiResponse({ status: 400, description: 'Validation error or business rule violation' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStationContactDto: UpdateStationContactDto
  ): Promise<StationContact> {
    return this.stationContactsService.update(id, updateStationContactDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete a station contact' })
  @ApiParam({ name: 'id', description: 'Contact ID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Contact successfully deleted' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.stationContactsService.remove(id);
  }

  @Patch(':id/set-primary')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Set contact as primary for the station' })
  @ApiParam({ name: 'id', description: 'Contact ID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Contact set as primary', type: StationContact })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  setPrincipal(@Param('id', ParseUUIDPipe) id: string): Promise<StationContact> {
    return this.stationContactsService.setPrincipal(id);
  }

  @Get('station/:stationId/primary')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.VIEWER)
  @ApiOperation({ summary: 'Get the primary contact for a station' })
  @ApiParam({ name: 'stationId', description: 'Station ID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Primary station contact', type: StationContact })
  @ApiResponse({ status: 200, description: 'No primary contact found', schema: { type: 'null' } })
  getPrimaryContact(@Param('stationId', ParseUUIDPipe) stationId: string): Promise<StationContact | null> {
    return this.stationContactsService.getPrimaryContact(stationId);
  }
}
