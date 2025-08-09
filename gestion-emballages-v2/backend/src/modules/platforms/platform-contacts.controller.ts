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
  Put,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { PlatformContactsService } from './platform-contacts.service';
import { CreatePlatformContactDto } from './dto/create-platform-contact.dto';
import { UpdatePlatformContactDto } from './dto/update-platform-contact.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';

@ApiTags('Platform Contacts')
@Controller('platforms/:platformId/contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PlatformContactsController {
  constructor(private readonly contactsService: PlatformContactsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Create a new contact for a platform' })
  @ApiResponse({ status: 201, description: 'Contact created successfully' })
  async create(
    @Param('platformId') platformId: string,
    @Body() createDto: CreatePlatformContactDto,
    @Request() req,
  ) {
    return this.contactsService.create(platformId, createDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contacts for a platform' })
  @ApiResponse({ status: 200, description: 'Contacts retrieved successfully' })
  async findAll(@Param('platformId') platformId: string) {
    return this.contactsService.findAll(platformId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active contacts for a platform' })
  @ApiResponse({ status: 200, description: 'Active contacts retrieved successfully' })
  async findActive(@Param('platformId') platformId: string) {
    return this.contactsService.findActive(platformId);
  }

  @Get('principal')
  @ApiOperation({ summary: 'Get the principal contact for a platform' })
  @ApiResponse({ status: 200, description: 'Principal contact retrieved successfully' })
  @ApiResponse({ status: 404, description: 'No principal contact found' })
  async findPrincipal(@Param('platformId') platformId: string) {
    return this.contactsService.findPrincipal(platformId);
  }

  @Get(':contactId')
  @ApiOperation({ summary: 'Get a specific contact for a platform' })
  @ApiResponse({ status: 200, description: 'Contact retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async findOne(
    @Param('platformId') platformId: string,
    @Param('contactId') contactId: string,
  ) {
    return this.contactsService.findOne(platformId, contactId);
  }

  @Put(':contactId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Update a contact for a platform' })
  @ApiResponse({ status: 200, description: 'Contact updated successfully' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async update(
    @Param('platformId') platformId: string,
    @Param('contactId') contactId: string,
    @Body() updateDto: UpdatePlatformContactDto,
    @Request() req,
  ) {
    return this.contactsService.update(platformId, contactId, updateDto, req.user.id);
  }

  @Patch(':contactId/set-principal')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set a contact as principal for a platform' })
  @ApiResponse({ status: 200, description: 'Contact set as principal successfully' })
  @ApiResponse({ status: 400, description: 'Cannot set inactive contact as principal' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async setPrincipal(
    @Param('platformId') platformId: string,
    @Param('contactId') contactId: string,
    @Request() req,
  ) {
    return this.contactsService.setPrincipal(platformId, contactId, req.user.id);
  }

  @Patch(':contactId/deactivate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a contact for a platform' })
  @ApiResponse({ status: 200, description: 'Contact deactivated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot deactivate principal contact' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async deactivate(
    @Param('platformId') platformId: string,
    @Param('contactId') contactId: string,
    @Request() req,
  ) {
    return this.contactsService.deactivate(platformId, contactId, req.user.id);
  }

  @Patch(':contactId/reactivate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reactivate a contact for a platform' })
  @ApiResponse({ status: 200, description: 'Contact reactivated successfully' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async reactivate(
    @Param('platformId') platformId: string,
    @Param('contactId') contactId: string,
    @Request() req,
  ) {
    return this.contactsService.reactivate(platformId, contactId, req.user.id);
  }

  @Delete(':contactId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a contact for a platform' })
  @ApiResponse({ status: 204, description: 'Contact deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete principal contact' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async remove(
    @Param('platformId') platformId: string,
    @Param('contactId') contactId: string,
  ) {
    await this.contactsService.remove(platformId, contactId);
  }
}