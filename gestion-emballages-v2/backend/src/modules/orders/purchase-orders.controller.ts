import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';
import { OrderStatus } from '@common/enums/order-status.enum';
import { PaginationDto } from '@common/dto/pagination.dto';

import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseOrder } from './entities/purchase-order.entity';

@ApiTags('Purchase Orders')
@Controller('purchase-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Create a new purchase order' })
  @ApiResponse({ status: 201, description: 'Purchase order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async create(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto, @Request() req: any): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.create(createPurchaseOrderDto, req.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Get all purchase orders with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Purchase orders retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'stationId', required: false, type: String, description: 'Filter by station' })
  @ApiQuery({ name: 'supplierId', required: false, type: String, description: 'Filter by supplier' })
  @ApiQuery({
    name: 'buyerType',
    required: false,
    enum: ['BLUE_WHALE', 'STATION'],
    description: 'Filter by buyer type',
  })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive'], description: 'Filter by status' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.purchaseOrdersService.findAll(paginationDto);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get purchase order statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiQuery({ name: 'stationId', required: false, type: String })
  @ApiQuery({ name: 'supplierId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getStats(
    @Query('stationId') stationId?: string,
    @Query('supplierId') supplierId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const filters = {
      stationId,
      supplierId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    return this.purchaseOrdersService.getOrderStats(filters);
  }

  @Get('by-station/:stationId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Get purchase orders by station' })
  @ApiParam({ name: 'stationId', description: 'Station ID' })
  @ApiResponse({ status: 200, description: 'Station purchase orders retrieved successfully' })
  async getByStation(@Param('stationId', ParseUUIDPipe) stationId: string, @Query() paginationDto: PaginationDto) {
    return this.purchaseOrdersService.getOrdersByStation(stationId, paginationDto);
  }

  @Get('by-supplier/:supplierId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Get purchase orders by supplier' })
  @ApiParam({ name: 'supplierId', description: 'Supplier ID' })
  @ApiResponse({ status: 200, description: 'Supplier purchase orders retrieved successfully' })
  async getBySupplier(@Param('supplierId', ParseUUIDPipe) supplierId: string, @Query() paginationDto: PaginationDto) {
    return this.purchaseOrdersService.getOrdersBySupplier(supplierId, paginationDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Get a purchase order by ID' })
  @ApiParam({ name: 'id', description: 'Purchase order ID' })
  @ApiResponse({ status: 200, description: 'Purchase order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Update a purchase order' })
  @ApiParam({ name: 'id', description: 'Purchase order ID' })
  @ApiResponse({ status: 200, description: 'Purchase order updated successfully' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto
  ): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.update(id, updatePurchaseOrderDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Update purchase order status' })
  @ApiParam({ name: 'id', description: 'Purchase order ID' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status', new ParseEnumPipe(OrderStatus)) status: OrderStatus,
    @Request() req: any
  ): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.updateStatus(id, status, req.user.id);
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Approve a purchase order' })
  @ApiParam({ name: 'id', description: 'Purchase order ID' })
  @ApiResponse({ status: 200, description: 'Purchase order approved successfully' })
  @ApiResponse({ status: 400, description: 'Purchase order cannot be approved' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  async approve(@Param('id', ParseUUIDPipe) id: string, @Request() req: any): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.approve(id, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete a purchase order' })
  @ApiParam({ name: 'id', description: 'Purchase order ID' })
  @ApiResponse({ status: 200, description: 'Purchase order deleted successfully' })
  @ApiResponse({ status: 400, description: 'Purchase order cannot be deleted' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.purchaseOrdersService.remove(id);
  }
}
