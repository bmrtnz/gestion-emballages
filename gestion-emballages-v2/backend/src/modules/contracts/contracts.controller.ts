import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

// Authentication request interface
interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: string;
    entityId?: string;
    entityType?: string;
  };
}
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { ContractsService } from './contracts.service';
import { ContractFiltersDto, CreateContractDto, UpdateContractDto } from './dto/contract.dto';
import { CreateProductSLADto, UpdateProductSLADto } from './dto/product-sla.dto';
import { MasterContract } from './entities/master-contract.entity';
import { ContractProductSLA } from './entities/contract-product-sla.entity';

@ApiTags('Contracts')
@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new master contract' })
  @ApiResponse({ status: 201, description: 'Contract created successfully', type: MasterContract })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async createContract(
    @Body() createContractDto: CreateContractDto,
    @Request() req: AuthenticatedRequest
  ): Promise<MasterContract> {
    return this.contractsService.create(createContractDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get contracts with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Contracts retrieved successfully' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  async getContracts(@Query() filters: ContractFiltersDto) {
    return this.contractsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contract by ID' })
  @ApiResponse({ status: 200, description: 'Contract found', type: MasterContract })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  async getContractById(@Param('id', ParseUUIDPipe) id: string): Promise<MasterContract> {
    return this.contractsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update contract' })
  @ApiResponse({ status: 200, description: 'Contract updated successfully', type: MasterContract })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async updateContract(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContractDto: UpdateContractDto,
    @Request() req: AuthenticatedRequest
  ): Promise<MasterContract> {
    return this.contractsService.update(id, updateContractDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate contract' })
  @ApiResponse({ status: 200, description: 'Contract deactivated successfully' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async deactivateContract(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.contractsService.deactivate(id);
    return { message: 'Contract deactivated successfully' };
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate contract' })
  @ApiResponse({ status: 200, description: 'Contract activated successfully' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async activateContract(@Param('id', ParseUUIDPipe) id: string): Promise<MasterContract> {
    return this.contractsService.activate(id);
  }

  @Post(':id/suspend')
  @ApiOperation({ summary: 'Suspend contract' })
  @ApiResponse({ status: 200, description: 'Contract suspended successfully' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async suspendContract(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason?: string
  ): Promise<MasterContract> {
    return this.contractsService.suspend(id, reason);
  }

  @Post(':id/renew')
  @ApiOperation({ summary: 'Renew contract' })
  @ApiResponse({ status: 200, description: 'Contract renewed successfully' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async renewContract(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    renewalData: {
      validUntil: string;
      contractName?: string;
      adjustments?: {
        defaultDeliverySLADays?: number;
        defaultQualityTolerancePercent?: number;
        lateDeliveryPenaltyPercent?: number;
        qualityIssuePenaltyPercent?: number;
      };
    },
    @Request() req: AuthenticatedRequest
  ): Promise<MasterContract> {
    return this.contractsService.renew(id, renewalData, req.user.id);
  }

  // Product SLA Management

  @Post(':id/product-slas')
  @ApiOperation({ summary: 'Add product-specific SLA to contract' })
  @ApiResponse({ status: 201, description: 'Product SLA created successfully', type: ContractProductSLA })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async addProductSLA(
    @Param('id', ParseUUIDPipe) contractId: string,
    @Body() createProductSLADto: CreateProductSLADto,
    @Request() req: AuthenticatedRequest
  ): Promise<ContractProductSLA> {
    return this.contractsService.addProductSLA(contractId, createProductSLADto, req.user.id);
  }

  @Get(':id/product-slas')
  @ApiOperation({ summary: 'Get all product SLAs for contract' })
  @ApiResponse({ status: 200, description: 'Product SLAs retrieved successfully' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  async getContractProductSLAs(@Param('id', ParseUUIDPipe) contractId: string, @Query('productId') productId?: string) {
    return this.contractsService.getProductSLAs(contractId, productId);
  }

  @Put(':id/product-slas/:slaId')
  @ApiOperation({ summary: 'Update product SLA' })
  @ApiResponse({ status: 200, description: 'Product SLA updated successfully', type: ContractProductSLA })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async updateProductSLA(
    @Param('id', ParseUUIDPipe) contractId: string,
    @Param('slaId', ParseUUIDPipe) slaId: string,
    @Body() updateProductSLADto: UpdateProductSLADto,
    @Request() req: AuthenticatedRequest
  ): Promise<ContractProductSLA> {
    return this.contractsService.updateProductSLA(contractId, slaId, updateProductSLADto, req.user.id);
  }

  @Delete(':id/product-slas/:slaId')
  @ApiOperation({ summary: 'Remove product SLA from contract' })
  @ApiResponse({ status: 200, description: 'Product SLA removed successfully' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async removeProductSLA(
    @Param('id', ParseUUIDPipe) contractId: string,
    @Param('slaId', ParseUUIDPipe) slaId: string
  ): Promise<{ message: string }> {
    await this.contractsService.removeProductSLA(contractId, slaId);
    return { message: 'Product SLA removed successfully' };
  }

  @Post(':id/product-slas/:slaId/suspend')
  @ApiOperation({ summary: 'Suspend product SLA enforcement' })
  @ApiResponse({ status: 200, description: 'Product SLA suspended successfully' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async suspendProductSLA(
    @Param('id', ParseUUIDPipe) contractId: string,
    @Param('slaId', ParseUUIDPipe) slaId: string,
    @Body('reason') reason: string
  ): Promise<ContractProductSLA> {
    return this.contractsService.suspendProductSLA(contractId, slaId, reason);
  }

  @Post(':id/product-slas/:slaId/resume')
  @ApiOperation({ summary: 'Resume product SLA enforcement' })
  @ApiResponse({ status: 200, description: 'Product SLA resumed successfully' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async resumeProductSLA(
    @Param('id', ParseUUIDPipe) contractId: string,
    @Param('slaId', ParseUUIDPipe) slaId: string
  ): Promise<ContractProductSLA> {
    return this.contractsService.resumeProductSLA(contractId, slaId);
  }

  // Contract Review and Approval

  @Post(':id/review')
  @ApiOperation({ summary: 'Submit contract for review' })
  @ApiResponse({ status: 200, description: 'Contract submitted for review' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async submitForReview(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reviewNotes') reviewNotes?: string
  ): Promise<MasterContract> {
    return this.contractsService.submitForReview(id, reviewNotes);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve contract' })
  @ApiResponse({ status: 200, description: 'Contract approved successfully' })
  @Roles(UserRole.ADMIN)
  async approveContract(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
    @Body('approvalNotes') approvalNotes?: string
  ): Promise<MasterContract> {
    return this.contractsService.approve(id, req.user.id, approvalNotes);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject contract' })
  @ApiResponse({ status: 200, description: 'Contract rejected' })
  @Roles(UserRole.ADMIN)
  async rejectContract(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('rejectionReason') rejectionReason: string,
    @Request() req: AuthenticatedRequest
  ): Promise<MasterContract> {
    return this.contractsService.reject(id, req.user.id, rejectionReason);
  }

  // Contract Utilities

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get contract summary with key metrics' })
  @ApiResponse({ status: 200, description: 'Contract summary retrieved' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  async getContractSummary(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.getContractSummary(id);
  }

  @Get(':id/products')
  @ApiOperation({ summary: 'Get all products covered by contract' })
  @ApiResponse({ status: 200, description: 'Contract products retrieved' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  async getContractProducts(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.getContractProducts(id);
  }

  @Post(':id/validate-slas')
  @ApiOperation({ summary: 'Validate all SLAs in contract for conflicts' })
  @ApiResponse({ status: 200, description: 'SLA validation completed' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async validateContractSLAs(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.validateSLAs(id);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get contracts expiring within specified days' })
  @ApiResponse({ status: 200, description: 'Expiring contracts retrieved' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getExpiringContracts(
    @Query('days') days: number = 30,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.contractsService.findExpiringContracts(days, page, limit);
  }

  @Get('by-supplier/:supplierId')
  @ApiOperation({ summary: 'Get all contracts for specific supplier' })
  @ApiResponse({ status: 200, description: 'Supplier contracts retrieved' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  async getContractsBySupplier(
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
    @Query('includeInactive') includeInactive: boolean = false
  ) {
    return this.contractsService.findBySupplier(supplierId, includeInactive);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get contract templates for creation' })
  @ApiResponse({ status: 200, description: 'Contract templates retrieved' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getContractTemplates() {
    return this.contractsService.getContractTemplates();
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Create new contract based on existing one' })
  @ApiResponse({ status: 201, description: 'Contract duplicated successfully' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async duplicateContract(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    duplicationOptions: {
      contractName: string;
      supplierId?: string;
      validFrom: string;
      validUntil: string;
      includeSLAs?: boolean;
      adjustments?: Record<string, unknown>;
    },
    @Request() req: AuthenticatedRequest
  ): Promise<MasterContract> {
    return this.contractsService.duplicate(id, duplicationOptions, req.user.id);
  }
}
