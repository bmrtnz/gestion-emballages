import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';
import { OrderStatus } from '@common/enums/order-status.enum';
import { SalesOrdersService } from './sales-orders.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { Request } from 'express';

@ApiTags('sales-orders')
@Controller('sales-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new sales order' })
  @ApiResponse({ status: 201, description: 'Sales order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createSalesOrderDto: CreateSalesOrderDto, @Req() req: Request) {
    const userId = req.user?.['id'];
    return this.salesOrdersService.create(createSalesOrderDto, userId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Get all sales orders with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Sales orders retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.salesOrdersService.findAll(paginationDto);
  }

  @Get('analytics')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get sales order analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAnalytics(@Query('platformId') platformId?: string) {
    return this.salesOrdersService.getSalesOrderAnalytics(platformId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Get a sales order by ID' })
  @ApiResponse({ status: 200, description: 'Sales order retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  async findOne(@Param('id') id: string) {
    return this.salesOrdersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Update a sales order' })
  @ApiResponse({ status: 200, description: 'Sales order updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  async update(@Param('id') id: string, @Body() updateSalesOrderDto: UpdateSalesOrderDto) {
    return this.salesOrdersService.update(id, updateSalesOrderDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Update sales order status' })
  @ApiResponse({ status: 200, description: 'Sales order status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  async updateStatus(@Param('id') id: string, @Body() body: { status: OrderStatus }, @Req() req: Request) {
    const userId = req.user?.['id'];
    return this.salesOrdersService.updateStatus(id, body.status, userId);
  }

  @Patch(':id/products/:productId/fulfillment')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Update product fulfillment status' })
  @ApiResponse({ status: 200, description: 'Product fulfillment updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Sales order product not found' })
  async updateProductFulfillment(
    @Param('id') salesOrderId: string,
    @Param('productId') productId: string,
    @Body()
    fulfillmentData: {
      quantityShipped?: number;
      quantityDelivered?: number;
      fulfillmentStatus?: 'PENDING' | 'PICKED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    }
  ) {
    return this.salesOrdersService.updateProductFulfillment(salesOrderId, productId, fulfillmentData);
  }

  @Post(':id/invoice')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Generate invoice for sales order' })
  @ApiResponse({ status: 200, description: 'Invoice generated successfully' })
  @ApiResponse({ status: 400, description: 'Invoice already exists or invalid state' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  async generateInvoice(@Param('id') id: string) {
    return this.salesOrdersService.generateInvoice(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a sales order' })
  @ApiResponse({ status: 204, description: 'Sales order deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete sales order in current status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  async remove(@Param('id') id: string) {
    return this.salesOrdersService.delete(id);
  }
}
