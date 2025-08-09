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

import { SupplierContactsService } from './Supplier-contacts.service';
import { CreateSupplierContactDto } from './dto/create-Supplier-contact.dto';
import { UpdateSupplierContactDto } from './dto/update-Supplier-contact.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';

@ApiTags('Supplier Contacts')
@Controller('fournisseurs/:fournisseurId/contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SupplierContactsController {
  constructor(private readonly contactsService: SupplierContactsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Create a new contact for a supplier' })
  @ApiResponse({ status: 201, description: 'Contact created successfully' })
  async create(
    @Param('fournisseurId') supplierId: string,
    @Body() createDto: CreateSupplierContactDto,
    @Request() req,
  ) {
    return this.contactsService.create(supplierId, createDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contacts for a supplier' })
  @ApiResponse({ status: 200, description: 'Contacts retrieved successfully' })
  async findAll(@Param('fournisseurId') supplierId: string) {
    return this.contactsService.findAll(supplierId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active contacts for a supplier' })
  @ApiResponse({ status: 200, description: 'Active contacts retrieved successfully' })
  async findActive(@Param('fournisseurId') supplierId: string) {
    return this.contactsService.findActive(supplierId);
  }

  @Get('principal')
  @ApiOperation({ summary: 'Get the principal contact for a supplier' })
  @ApiResponse({ status: 200, description: 'Principal contact retrieved successfully' })
  @ApiResponse({ status: 404, description: 'No principal contact found' })
  async findPrincipal(@Param('fournisseurId') supplierId: string) {
    return this.contactsService.findPrincipal(supplierId);
  }

  @Get(':contactId')
  @ApiOperation({ summary: 'Get a specific contact for a supplier' })
  @ApiResponse({ status: 200, description: 'Contact retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async findOne(
    @Param('fournisseurId') supplierId: string,
    @Param('contactId') contactId: string,
  ) {
    return this.contactsService.findOne(supplierId, contactId);
  }

  @Put(':contactId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Update a contact for a supplier' })
  @ApiResponse({ status: 200, description: 'Contact updated successfully' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async update(
    @Param('fournisseurId') supplierId: string,
    @Param('contactId') contactId: string,
    @Body() updateDto: UpdateSupplierContactDto,
    @Request() req,
  ) {
    return this.contactsService.update(supplierId, contactId, updateDto, req.user.id);
  }

  @Patch(':contactId/set-principal')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set a contact as principal for a supplier' })
  @ApiResponse({ status: 200, description: 'Contact set as principal successfully' })
  @ApiResponse({ status: 400, description: 'Cannot set inactive contact as principal' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async setPrincipal(
    @Param('fournisseurId') supplierId: string,
    @Param('contactId') contactId: string,
    @Request() req,
  ) {
    return this.contactsService.setPrincipal(supplierId, contactId, req.user.id);
  }

  @Patch(':contactId/deactivate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a contact for a supplier' })
  @ApiResponse({ status: 200, description: 'Contact deactivated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot deactivate principal contact' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async deactivate(
    @Param('fournisseurId') supplierId: string,
    @Param('contactId') contactId: string,
    @Request() req,
  ) {
    return this.contactsService.deactivate(supplierId, contactId, req.user.id);
  }

  @Patch(':contactId/reactivate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reactivate a contact for a supplier' })
  @ApiResponse({ status: 200, description: 'Contact reactivated successfully' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async reactivate(
    @Param('fournisseurId') supplierId: string,
    @Param('contactId') contactId: string,
    @Request() req,
  ) {
    return this.contactsService.reactivate(supplierId, contactId, req.user.id);
  }

  @Delete(':contactId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a contact for a supplier' })
  @ApiResponse({ status: 204, description: 'Contact deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete principal contact' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async remove(
    @Param('fournisseurId') supplierId: string,
    @Param('contactId') contactId: string,
  ) {
    await this.contactsService.remove(supplierId, contactId);
  }
}