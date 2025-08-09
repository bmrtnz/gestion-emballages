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

import { TransfersService } from './transfers.service';
import { CreateTransferRequestDto } from './dto/create-transfer-request.dto';
import { UpdateTransferRequestDto, ApproveTransferDto } from './dto/update-transfer-request.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';
import { TransferStatus } from '@common/enums/transfer-status.enum';

@ApiTags('Transfers')
@Controller('transfers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Create a new transfer request' })
  @ApiResponse({ status: 201, description: 'Transfer request created successfully' })
  async create(@Body() createTransferRequestDto: CreateTransferRequestDto, @Request() req) {
    return this.transfersService.createDemandeTransfert(createTransferRequestDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transfer requests with pagination' })
  @ApiResponse({ status: 200, description: 'Transfer requests retrieved successfully' })
  async findAll(@Query() paginationDto: PaginationDto, @Request() req) {
    // Add role-based filtering
    if (req.user.role === UserRole.STATION) {
      // Stations can see transfers they requested or transfers from them
      paginationDto['requestingStationId'] = req.user.entiteId;
      // OR logic would need to be handled in service for both requesting and source station
    }

    return this.transfersService.findAll(paginationDto);
  }

  @Get('pending-approvals')
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Get transfer requests pending approval' })
  @ApiResponse({ status: 200, description: 'Pending transfer requests retrieved successfully' })
  async getPendingApprovals(@Request() req) {
    // For station users, show only transfers where they are the source station
    const stationId = req.user.role === UserRole.STATION ? req.user.entiteId : undefined;
    return this.transfersService.getPendingApprovals(stationId);
  }

  @Get('analytics')
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Get transfer analytics' })
  @ApiResponse({ status: 200, description: 'Transfer analytics retrieved successfully' })
  async getAnalytics(@Query('stationId') stationId?: string, @Request() req?) {
    // For station users, limit to their station
    const effectiveStationId = req.user.role === UserRole.STATION ? req.user.entiteId : stationId;
    return this.transfersService.getTransferAnalytics(effectiveStationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transfer request by ID' })
  @ApiResponse({ status: 200, description: 'Transfer request retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.transfersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Update transfer request' })
  @ApiResponse({ status: 200, description: 'Transfer request updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateTransferRequestDto: UpdateTransferRequestDto
  ) {
    return this.transfersService.update(id, updateTransferRequestDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Update transfer request status' })
  @ApiResponse({ status: 200, description: 'Transfer request status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: TransferStatus }
  ) {
    return this.transfersService.updateStatus(id, body.status);
  }

  @Patch(':id/approve')
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Approve transfer request with quantities' })
  @ApiResponse({ status: 200, description: 'Transfer request approved successfully' })
  async approve(
    @Param('id') id: string,
    @Body() approveTransferDto: ApproveTransferDto
  ) {
    return this.transfersService.approveTransfer(id, approveTransferDto);
  }

  @Patch(':id/reject')
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Reject transfer request' })
  @ApiResponse({ status: 200, description: 'Transfer request rejected successfully' })
  async reject(
    @Param('id') id: string,
    @Body() body: { reason?: string }
  ) {
    return this.transfersService.rejectTransfer(id, body.reason);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION)
  @ApiOperation({ summary: 'Delete transfer request' })
  @ApiResponse({ status: 200, description: 'Transfer request deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.transfersService.delete(id);
  }

  // Utility endpoints
  @Get('status/list')
  @ApiOperation({ summary: 'Get available transfer statuses' })
  @ApiResponse({ status: 200, description: 'Transfer statuses retrieved successfully' })
  async getTransferStatuses() {
    return {
      statuses: Object.values(TransferStatus).map(status => ({
        value: status,
        label: status
      }))
    };
  }
}