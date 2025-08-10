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

import { ShoppingCartsService } from './shopping-carts.service';
import { CreateShoppingCartDto } from './dto/create-shopping-cart.dto';
import {
  AddItemToShoppingCartDto,
  UpdateShoppingCartDto,
  ValidateShoppingCartDto,
} from './dto/update-shopping-cart.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';

@ApiTags("Listes d'achat")
@Controller('shopping-carts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class ShoppingCartsController {
  constructor(private readonly shoppingCartsService: ShoppingCartsService) {}

  @Post()
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Create a new shopping list' })
  @ApiResponse({ status: 201, description: 'Shopping list created successfully' })
  async create(@Body() createShoppingCartDto: CreateShoppingCartDto, @Request() req) {
    return this.shoppingCartsService.create(createShoppingCartDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shopping lists with pagination' })
  @ApiResponse({ status: 200, description: 'Shopping lists retrieved successfully' })
  async findAll(@Query() paginationDto: PaginationDto, @Request() req) {
    // Add role-based filtering
    if (req.user.role === UserRole.STATION) {
      paginationDto['stationId'] = req.user.entiteId;
    }

    return this.shoppingCartsService.findAll(paginationDto);
  }

  @Get('active/:stationId')
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Get active shopping list for a station' })
  @ApiResponse({ status: 200, description: 'Active shopping list retrieved successfully' })
  async getActiveByStation(@Param('stationId') stationId: string, @Request() req) {
    // Station users can only access their own list
    if (req.user.role === UserRole.STATION && req.user.entiteId !== stationId) {
      throw new Error('Accès non autorisé');
    }

    return this.shoppingCartsService.findActiveByStation(stationId);
  }

  @Get('analytics')
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Get shopping list analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getAnalytics(@Query('stationId') stationId?: string, @Request() req?) {
    // For station users, limit to their station
    const effectiveStationId = req.user.role === UserRole.STATION ? req.user.entiteId : stationId;
    return this.shoppingCartsService.getListeAchatAnalytics(effectiveStationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shopping list by ID' })
  @ApiResponse({ status: 200, description: 'Shopping list retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.shoppingCartsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Update shopping list' })
  @ApiResponse({ status: 200, description: 'Shopping list updated successfully' })
  async update(@Param('id') id: string, @Body() updateShoppingCartDto: UpdateShoppingCartDto) {
    return this.shoppingCartsService.update(id, updateShoppingCartDto);
  }

  @Post(':id/items')
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Add item to shopping list' })
  @ApiResponse({ status: 200, description: 'Item added successfully' })
  async addItem(@Param('id') id: string, @Body() addItemDto: AddItemToShoppingCartDto) {
    return this.shoppingCartsService.addItem(id, addItemDto);
  }

  @Delete(':id/items/:itemId')
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Remove item from shopping list' })
  @ApiResponse({ status: 200, description: 'Item removed successfully' })
  async removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.shoppingCartsService.removeItem(id, itemId);
  }

  @Post(':id/validate')
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Validate shopping list and convert to orders' })
  @ApiResponse({ status: 200, description: 'Shopping list validated and orders created' })
  async validateAndConvertToOrders(@Param('id') id: string, @Body() validateDto: ValidateShoppingCartDto) {
    return this.shoppingCartsService.validateAndConvertToOrders(id, validateDto);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Delete shopping list' })
  @ApiResponse({ status: 200, description: 'Shopping list deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.shoppingCartsService.delete(id);
  }
}
