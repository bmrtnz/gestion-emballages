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

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateMasterOrderDto } from './dto/create-master-order.dto';
import { UpdateMasterOrderDto } from './dto/update-master-order.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';
import { OrderStatus } from '@common/enums/order-status.enum';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class OrdersController {
  constructor(private readonly OrdersService: OrdersService) {}

  // Individual Orders (Commandes)
  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createCommande(@Body() CreateOrderDto: CreateOrderDto, @Request() req) {
    return this.OrdersService.createCommande(CreateOrderDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders with pagination' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async findAllCommandes(@Query() paginationDto: PaginationDto, @Request() req) {
    // Add role-based filtering
    if (req.user.role === UserRole.STATION) {
      paginationDto['stationId'] = req.user.entiteId;
    } else if (req.user.role === UserRole.SUPPLIER) {
      paginationDto['fournisseurId'] = req.user.entiteId;
    }

    return this.OrdersService.findAllCommandes(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  async findOneCommande(@Param('id') id: string) {
    return this.OrdersService.findOneCommande(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION, UserRole.SUPPLIER)
  @ApiOperation({ summary: 'Update order' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  async updateCommande(
    @Param('id') id: string,
    @Body() UpdateOrderDto: UpdateOrderDto
  ) {
    return this.OrdersService.updateCommande(id, UpdateOrderDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION, UserRole.SUPPLIER)
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  async updateCommandeStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus }
  ) {
    return this.OrdersService.updateCommandeStatus(id, body.status);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Delete order' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  async deleteCommande(@Param('id') id: string) {
    return this.OrdersService.deleteCommande(id);
  }

  // Global Orders (Commandes Globales)
  @Post('globales')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Create a new global order' })
  @ApiResponse({ status: 201, description: 'Global order created successfully' })
  async createCommandeGlobale(
    @Body() CreateMasterOrderDto: CreateMasterOrderDto,
    @Request() req
  ) {
    return this.OrdersService.createCommandeGlobale(CreateMasterOrderDto, req.user.id);
  }

  @Get('globales/list')
  @ApiOperation({ summary: 'Get all global orders with pagination' })
  @ApiResponse({ status: 200, description: 'Global orders retrieved successfully' })
  async findAllCommandesGlobales(@Query() paginationDto: PaginationDto, @Request() req) {
    // Add role-based filtering
    if (req.user.role === UserRole.STATION) {
      paginationDto['stationId'] = req.user.entiteId;
    }

    return this.OrdersService.findAllCommandesGlobales(paginationDto);
  }

  @Get('globales/:id')
  @ApiOperation({ summary: 'Get global order by ID' })
  @ApiResponse({ status: 200, description: 'Global order retrieved successfully' })
  async findOneCommandeGlobale(@Param('id') id: string) {
    return this.OrdersService.findOneCommandeGlobale(id);
  }

  @Patch('globales/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Update global order' })
  @ApiResponse({ status: 200, description: 'Global order updated successfully' })
  async updateCommandeGlobale(
    @Param('id') id: string,
    @Body() UpdateMasterOrderDto: UpdateMasterOrderDto
  ) {
    return this.OrdersService.updateCommandeGlobale(id, UpdateMasterOrderDto);
  }

  @Patch('globales/:id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Update global order status' })
  @ApiResponse({ status: 200, description: 'Global order status updated successfully' })
  async updateCommandeGlobaleStatus(
    @Param('id') id: string,
    @Body() body: { statutGeneral: OrderStatus }
  ) {
    return this.OrdersService.updateCommandeGlobaleStatus(id, body.statutGeneral);
  }

  @Delete('globales/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Delete global order' })
  @ApiResponse({ status: 200, description: 'Global order deleted successfully' })
  async deleteCommandeGlobale(@Param('id') id: string) {
    return this.OrdersService.deleteCommandeGlobale(id);
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