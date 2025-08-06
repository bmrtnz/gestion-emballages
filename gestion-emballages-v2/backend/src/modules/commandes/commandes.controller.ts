import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { CommandesService } from './commandes.service';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { UpdateCommandeDto } from './dto/update-commande.dto';
import { CreateCommandeGlobaleDto } from './dto/create-commande-globale.dto';
import { UpdateCommandeGlobaleDto } from './dto/update-commande-globale.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';
import { OrderStatus } from '@common/enums/order-status.enum';

@ApiTags('Commandes')
@Controller('commandes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class CommandesController {
  constructor(private readonly commandesService: CommandesService) {}

  // Individual Orders (Commandes)
  @Post()
  @Roles(UserRole.MANAGER, UserRole.GESTIONNAIRE, UserRole.STATION)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createCommande(@Body() createCommandeDto: CreateCommandeDto, @Request() req) {
    return this.commandesService.createCommande(createCommandeDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders with pagination' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async findAllCommandes(@Query() paginationDto: PaginationDto, @Request() req) {
    // Add role-based filtering
    if (req.user.role === UserRole.STATION) {
      paginationDto['stationId'] = req.user.entiteId;
    } else if (req.user.role === UserRole.FOURNISSEUR) {
      paginationDto['fournisseurId'] = req.user.entiteId;
    }

    return this.commandesService.findAllCommandes(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  async findOneCommande(@Param('id') id: string) {
    return this.commandesService.findOneCommande(id);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER, UserRole.GESTIONNAIRE, UserRole.STATION, UserRole.FOURNISSEUR)
  @ApiOperation({ summary: 'Update order' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  async updateCommande(
    @Param('id') id: string,
    @Body() updateCommandeDto: UpdateCommandeDto
  ) {
    return this.commandesService.updateCommande(id, updateCommandeDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.MANAGER, UserRole.GESTIONNAIRE, UserRole.STATION, UserRole.FOURNISSEUR)
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  async updateCommandeStatus(
    @Param('id') id: string,
    @Body() body: { statut: OrderStatus }
  ) {
    return this.commandesService.updateCommandeStatus(id, body.statut);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER, UserRole.GESTIONNAIRE, UserRole.STATION)
  @ApiOperation({ summary: 'Delete order' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  async deleteCommande(@Param('id') id: string) {
    return this.commandesService.deleteCommande(id);
  }

  // Global Orders (Commandes Globales)
  @Post('globales')
  @Roles(UserRole.MANAGER, UserRole.GESTIONNAIRE, UserRole.STATION)
  @ApiOperation({ summary: 'Create a new global order' })
  @ApiResponse({ status: 201, description: 'Global order created successfully' })
  async createCommandeGlobale(
    @Body() createCommandeGlobaleDto: CreateCommandeGlobaleDto,
    @Request() req
  ) {
    return this.commandesService.createCommandeGlobale(createCommandeGlobaleDto, req.user.id);
  }

  @Get('globales/list')
  @ApiOperation({ summary: 'Get all global orders with pagination' })
  @ApiResponse({ status: 200, description: 'Global orders retrieved successfully' })
  async findAllCommandesGlobales(@Query() paginationDto: PaginationDto, @Request() req) {
    // Add role-based filtering
    if (req.user.role === UserRole.STATION) {
      paginationDto['stationId'] = req.user.entiteId;
    }

    return this.commandesService.findAllCommandesGlobales(paginationDto);
  }

  @Get('globales/:id')
  @ApiOperation({ summary: 'Get global order by ID' })
  @ApiResponse({ status: 200, description: 'Global order retrieved successfully' })
  async findOneCommandeGlobale(@Param('id') id: string) {
    return this.commandesService.findOneCommandeGlobale(id);
  }

  @Patch('globales/:id')
  @Roles(UserRole.MANAGER, UserRole.GESTIONNAIRE, UserRole.STATION)
  @ApiOperation({ summary: 'Update global order' })
  @ApiResponse({ status: 200, description: 'Global order updated successfully' })
  async updateCommandeGlobale(
    @Param('id') id: string,
    @Body() updateCommandeGlobaleDto: UpdateCommandeGlobaleDto
  ) {
    return this.commandesService.updateCommandeGlobale(id, updateCommandeGlobaleDto);
  }

  @Patch('globales/:id/status')
  @Roles(UserRole.MANAGER, UserRole.GESTIONNAIRE, UserRole.STATION)
  @ApiOperation({ summary: 'Update global order status' })
  @ApiResponse({ status: 200, description: 'Global order status updated successfully' })
  async updateCommandeGlobaleStatus(
    @Param('id') id: string,
    @Body() body: { statutGeneral: OrderStatus }
  ) {
    return this.commandesService.updateCommandeGlobaleStatus(id, body.statutGeneral);
  }

  @Delete('globales/:id')
  @Roles(UserRole.MANAGER, UserRole.GESTIONNAIRE, UserRole.STATION)
  @ApiOperation({ summary: 'Delete global order' })
  @ApiResponse({ status: 200, description: 'Global order deleted successfully' })
  async deleteCommandeGlobale(@Param('id') id: string) {
    return this.commandesService.deleteCommandeGlobale(id);
  }

  // Utility endpoints
  @Get('status/list')
  @ApiOperation({ summary: 'Get available order statuses' })
  @ApiResponse({ status: 200, description: 'Order statuses retrieved successfully' })
  async getOrderStatuses() {
    return {
      statuses: Object.values(OrderStatus).map(status => ({
        value: status,
        label: status
      }))
    };
  }
}