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

import { StocksService } from './stocks.service';
import { CreateStockStationDto } from './dto/create-stock-station.dto';
import { AdjustStockDto, UpdateStockStationDto } from './dto/update-stock-station.dto';
import { CreateStockSupplierDto } from './dto/create-stock-supplier.dto';
import { UpdateStockSupplierDto } from './dto/update-stock-supplier.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';

@ApiTags('Stocks')
@Controller('stocks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  // Station Stock Management
  @Post('stations')
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Create station stock entry' })
  @ApiResponse({ status: 201, description: 'Station stock created successfully' })
  async createStockStation(@Body() createStockStationDto: CreateStockStationDto, @Request() req) {
    return this.stocksService.createStockStation(createStockStationDto, req.user.id);
  }

  @Get('stations')
  @ApiOperation({ summary: 'Get all station stocks with pagination' })
  @ApiResponse({ status: 200, description: 'Station stocks retrieved successfully' })
  async findAllStockStations(@Query() paginationDto: PaginationDto, @Request() req) {
    // Add role-based filtering
    if (req.user.role === UserRole.STATION) {
      paginationDto['stationId'] = req.user.entiteId;
    }

    return this.stocksService.findAllStockStations(paginationDto);
  }

  @Get('stations/:id')
  @ApiOperation({ summary: 'Get station stock by ID' })
  @ApiResponse({ status: 200, description: 'Station stock retrieved successfully' })
  async findOneStockStation(@Param('id') id: string) {
    return this.stocksService.findOneStockStation(id);
  }

  @Get('stations/by-location/:stationId/Product/:articleId')
  @ApiOperation({ summary: 'Get stock by station and Product' })
  @ApiResponse({ status: 200, description: 'Stock retrieved successfully' })
  async findStockByStationAndArticle(@Param('stationId') stationId: string, @Param('articleId') articleId: string) {
    return this.stocksService.findStockByStationAndArticle(stationId, articleId);
  }

  @Patch('stations/:id')
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Update station stock' })
  @ApiResponse({ status: 200, description: 'Station stock updated successfully' })
  async updateStockStation(
    @Param('id') id: string,
    @Body() updateStockStationDto: UpdateStockStationDto,
    @Request() req
  ) {
    return this.stocksService.updateStockStation(id, updateStockStationDto, req.user.id);
  }

  @Patch('stations/:id/adjust')
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Adjust station stock quantity' })
  @ApiResponse({ status: 200, description: 'Station stock adjusted successfully' })
  async adjustStockStation(@Param('id') id: string, @Body() adjustStockDto: AdjustStockDto, @Request() req) {
    return this.stocksService.adjustStockStation(id, adjustStockDto, req.user.id);
  }

  @Delete('stations/:id')
  @Roles(UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Delete station stock' })
  @ApiResponse({ status: 200, description: 'Station stock deleted successfully' })
  async deleteStockStation(@Param('id') id: string) {
    return this.stocksService.deleteStockStation(id);
  }

  // Supplier Stock Management
  @Post('fournisseurs')
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.SUPPLIER)
  @ApiOperation({ summary: 'Create supplier stock entry' })
  @ApiResponse({ status: 201, description: 'Supplier stock created successfully' })
  async createStockFournisseur(@Body() createStockSupplierDto: CreateStockSupplierDto) {
    return this.stocksService.createStockFournisseur(createStockSupplierDto);
  }

  @Get('fournisseurs')
  @ApiOperation({ summary: 'Get all supplier stocks with pagination' })
  @ApiResponse({ status: 200, description: 'Supplier stocks retrieved successfully' })
  async findAllStockFournisseurs(@Query() paginationDto: PaginationDto, @Request() req) {
    // Add role-based filtering
    if (req.user.role === UserRole.SUPPLIER) {
      paginationDto['fournisseurId'] = req.user.entiteId;
    }

    return this.stocksService.findAllStockFournisseurs(paginationDto);
  }

  @Get('fournisseurs/:id')
  @ApiOperation({ summary: 'Get supplier stock by ID' })
  @ApiResponse({ status: 200, description: 'Supplier stock retrieved successfully' })
  async findOneStockFournisseur(@Param('id') id: string) {
    return this.stocksService.findOneStockFournisseur(id);
  }

  @Get('fournisseurs/by-location/:fournisseurSiteId/Product/:articleId')
  @ApiOperation({ summary: 'Get stock by supplier site and Product' })
  @ApiResponse({ status: 200, description: 'Stock retrieved successfully' })
  async findStockByFournisseurSiteAndArticle(
    @Param('fournisseurSiteId') fournisseurSiteId: string,
    @Param('articleId') articleId: string
  ) {
    return this.stocksService.findStockByFournisseurSiteAndArticle(fournisseurSiteId, articleId);
  }

  @Patch('fournisseurs/:id')
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.SUPPLIER)
  @ApiOperation({ summary: 'Update supplier stock' })
  @ApiResponse({ status: 200, description: 'Supplier stock updated successfully' })
  async updateStockFournisseur(@Param('id') id: string, @Body() updateStockSupplierDto: UpdateStockSupplierDto) {
    return this.stocksService.updateStockFournisseur(id, updateStockSupplierDto);
  }

  @Delete('fournisseurs/:id')
  @Roles(UserRole.MANAGER, UserRole.HANDLER)
  @ApiOperation({ summary: 'Delete supplier stock' })
  @ApiResponse({ status: 200, description: 'Supplier stock deleted successfully' })
  async deleteStockFournisseur(@Param('id') id: string) {
    return this.stocksService.deleteStockFournisseur(id);
  }

  // Analytics and Reports
  @Get('analytics/overview')
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Get stock analytics overview' })
  @ApiResponse({ status: 200, description: 'Stock analytics retrieved successfully' })
  async getStockAnalytics(@Query('stationId') stationId?: string, @Request() req?) {
    // For station users, limit to their station
    const effectiveStationId = req.user.role === UserRole.STATION ? req.user.entiteId : stationId;
    return this.stocksService.getStockAnalytics(effectiveStationId);
  }

  @Get('alerts/low-stock')
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Get low stock alerts' })
  @ApiResponse({ status: 200, description: 'Low stock alerts retrieved successfully' })
  async getLowStockAlerts(@Query('stationId') stationId?: string, @Request() req?) {
    // For station users, limit to their station
    const effectiveStationId = req.user.role === UserRole.STATION ? req.user.entiteId : stationId;
    return this.stocksService.getLowStockAlerts(effectiveStationId);
  }

  @Get('movements/:articleId')
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Get stock movements for an Product' })
  @ApiResponse({ status: 200, description: 'Stock movements retrieved successfully' })
  async getStockMovements(
    @Param('articleId') articleId: string,
    @Query('stationId') stationId?: string,
    @Query('days') days?: number,
    @Request() req?
  ) {
    // For station users, limit to their station
    const effectiveStationId = req.user.role === UserRole.STATION ? req.user.entiteId : stationId;
    return this.stocksService.getStockMovements(articleId, effectiveStationId, days || 30);
  }
}
