import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import {
  ContractAdherenceService,
  ContractPerformanceReport,
  DashboardMetrics,
} from '../services/contract-adherence.service';
import { MeasurementPeriod, MetricType, PerformanceStatus } from '../entities/contract-performance-metric.entity';
import { ContractsService } from '../contracts.service';
import { PaginationDto } from '@common/dto/pagination.dto';
import { UserRole } from '@common/enums/user-role.enum';

class PerformanceFiltersDto extends PaginationDto {
  @ApiProperty({ required: false, description: 'Filter by supplier ID' })
  supplierId?: string;

  @ApiProperty({ required: false, description: 'Filter by product ID' })
  productId?: string;

  @ApiProperty({ required: false, enum: MetricType, description: 'Filter by metric type' })
  metricType?: MetricType;

  @ApiProperty({ required: false, enum: PerformanceStatus, description: 'Filter by performance status' })
  status?: PerformanceStatus;

  @ApiProperty({ required: false, description: 'Start date (YYYY-MM-DD)' })
  startDate?: string;

  @ApiProperty({ required: false, description: 'End date (YYYY-MM-DD)' })
  endDate?: string;

  @ApiProperty({ required: false, enum: MeasurementPeriod, description: 'Measurement period' })
  measurementPeriod?: MeasurementPeriod;

  @ApiProperty({ required: false, description: 'Show only contracts at risk' })
  atRiskOnly?: boolean;

  @ApiProperty({ required: false, description: 'Show only escalated metrics' })
  escalatedOnly?: boolean;
}

class CalculatePerformanceDto {
  @ApiProperty({ required: true, description: 'Start date (YYYY-MM-DD)' })
  startDate: string;

  @ApiProperty({ required: true, description: 'End date (YYYY-MM-DD)' })
  endDate: string;

  @ApiProperty({ required: false, enum: MeasurementPeriod, description: 'Measurement period' })
  measurementPeriod?: MeasurementPeriod;

  @ApiProperty({ required: false, description: 'Contract IDs to calculate (if empty, all active contracts)' })
  contractIds?: string[];
}

class UpdateMetricDto {
  @ApiProperty({ required: false, description: 'Review notes' })
  reviewNotes?: string;

  @ApiProperty({ required: false, description: 'Action plan' })
  actionPlan?: string;

  @ApiProperty({ required: false, description: 'Action deadline (YYYY-MM-DD)' })
  actionDeadline?: string;

  @ApiProperty({ required: false, description: 'Mark as reviewed' })
  markAsReviewed?: boolean;

  @ApiProperty({ required: false, description: 'Escalation notes' })
  escalationNotes?: string;
}

@ApiTags('Contract Performance')
@Controller('contract-performance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ContractPerformanceController {
  constructor(
    private readonly contractAdherenceService: ContractAdherenceService,
    private readonly contractsService: ContractsService
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get manager dashboard metrics' })
  @ApiResponse({ status: 200, description: 'Dashboard metrics retrieved successfully' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return this.contractAdherenceService.getDashboardMetrics();
  }

  @Get('contracts/:id/report')
  @ApiOperation({ summary: 'Generate performance report for specific contract' })
  @ApiResponse({ status: 200, description: 'Contract performance report generated' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  async getContractPerformanceReport(
    @Param('id', ParseUUIDPipe) contractId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<ContractPerformanceReport> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.contractAdherenceService.generateContractPerformanceReport(contractId, start, end);
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate performance metrics for specified period' })
  @ApiResponse({ status: 200, description: 'Performance calculation initiated' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async calculatePerformanceMetrics(@Body() calculateDto: CalculatePerformanceDto) {
    const startDate = new Date(calculateDto.startDate);
    const endDate = new Date(calculateDto.endDate);
    const measurementPeriod = calculateDto.measurementPeriod || MeasurementPeriod.MONTHLY;

    const results = await this.contractAdherenceService.calculateAllContractPerformance(
      startDate,
      endDate,
      measurementPeriod
    );

    return {
      message: 'Performance calculation completed',
      period: {
        start: startDate,
        end: endDate,
        measurementPeriod,
      },
      results: {
        totalMetricsCalculated: results.length,
        contractsProcessed: [...new Set(results.map(r => r.contractId))].length,
        metricsBreakdown: {
          excellent: results.filter(r => r.status === PerformanceStatus.EXCELLENT).length,
          good: results.filter(r => r.status === PerformanceStatus.GOOD).length,
          warning: results.filter(r => r.status === PerformanceStatus.WARNING).length,
          breach: results.filter(r => r.status === PerformanceStatus.BREACH).length,
          critical: results.filter(r => r.status === PerformanceStatus.CRITICAL).length,
        },
        financialImpact: {
          totalPenalties: results.reduce((sum, r) => sum + (r.financialImpact?.penalties || 0), 0),
          totalBonuses: results.reduce((sum, r) => sum + (r.financialImpact?.bonuses || 0), 0),
          netImpact: results.reduce((sum, r) => sum + (r.financialImpact?.netImpact || 0), 0),
        },
      },
    };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get performance metrics with filters' })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  async getPerformanceMetrics(@Query() filters: PerformanceFiltersDto) {
    // This would use the ContractPerformanceMetric repository with filters
    // Implementation would be similar to other listing endpoints
    return {
      message: 'Performance metrics endpoint - implementation would query ContractPerformanceMetric repository',
      filters,
      note: 'This would return paginated performance metrics with applied filters',
    };
  }

  @Get('contracts-at-risk')
  @ApiOperation({ summary: 'Get contracts currently at risk' })
  @ApiResponse({ status: 200, description: 'At-risk contracts retrieved' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getContractsAtRisk(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('severity') severity?: 'HIGH' | 'CRITICAL'
  ) {
    // This would query contracts with recent BREACH or CRITICAL performance metrics
    return {
      message: 'Contracts at risk endpoint',
      filters: { page, limit, severity },
      note: 'This would return contracts with poor performance metrics and escalations',
    };
  }

  @Get('escalations')
  @ApiOperation({ summary: 'Get all pending escalations' })
  @ApiResponse({ status: 200, description: 'Pending escalations retrieved' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getPendingEscalations(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
    @Query('level', ParseIntPipe) escalationLevel?: number,
    @Query('overdue') overdue?: boolean
  ) {
    // This would query ContractPerformanceMetric with escalationTriggered = true
    return {
      message: 'Pending escalations endpoint',
      filters: { page, limit, escalationLevel, overdue },
      note: 'This would return metrics requiring management attention',
    };
  }

  @Put('metrics/:id')
  @ApiOperation({ summary: 'Update performance metric (add review notes, action plans)' })
  @ApiResponse({ status: 200, description: 'Metric updated successfully' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async updatePerformanceMetric(@Param('id', ParseUUIDPipe) metricId: string, @Body() updateDto: UpdateMetricDto) {
    // This would update a ContractPerformanceMetric record
    return {
      message: 'Metric update endpoint',
      metricId,
      updates: updateDto,
      note: 'This would update metric with review notes and action plans',
    };
  }

  @Post('metrics/:id/escalate')
  @ApiOperation({ summary: 'Manually trigger escalation for a metric' })
  @ApiResponse({ status: 200, description: 'Escalation triggered successfully' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async escalateMetric(
    @Param('id', ParseUUIDPipe) metricId: string,
    @Body('notes') notes?: string,
    @Body('level', ParseIntPipe) level?: number
  ) {
    // This would trigger escalation on a ContractPerformanceMetric
    return {
      message: 'Manual escalation endpoint',
      metricId,
      escalationLevel: level || 3,
      notes,
      note: 'This would trigger escalation workflow for the metric',
    };
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get performance trends over time' })
  @ApiResponse({ status: 200, description: 'Performance trends retrieved' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER)
  async getPerformanceTrends(
    @Query('contractId') contractId?: string,
    @Query('productId') productId?: string,
    @Query('metricType', new ParseEnumPipe(MetricType, { optional: true })) metricType?: MetricType,
    @Query('months', new DefaultValuePipe(12), ParseIntPipe) months: number = 12
  ) {
    // This would calculate trends over specified period
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return {
      message: 'Performance trends endpoint',
      period: { startDate, endDate },
      filters: { contractId, productId, metricType },
      note: 'This would return trend analysis showing performance over time',
    };
  }

  @Get('supplier-rankings')
  @ApiOperation({ summary: 'Get supplier performance rankings' })
  @ApiResponse({ status: 200, description: 'Supplier rankings retrieved' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getSupplierRankings(
    @Query('period', new DefaultValuePipe(90), ParseIntPipe) periodDays: number = 90,
    @Query('metricType', new ParseEnumPipe(MetricType, { optional: true })) metricType?: MetricType
  ) {
    // This would rank suppliers by performance metrics
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    return {
      message: 'Supplier rankings endpoint',
      period: { startDate, endDate, days: periodDays },
      metricType,
      note: 'This would return suppliers ranked by performance scores',
    };
  }

  @Get('financial-impact')
  @ApiOperation({ summary: 'Get financial impact summary' })
  @ApiResponse({ status: 200, description: 'Financial impact retrieved' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getFinancialImpact(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('contractId') contractId?: string,
    @Query('supplierId') supplierId?: string
  ) {
    // This would calculate total penalties, bonuses, and net impact
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    return {
      message: 'Financial impact summary endpoint',
      period: { start, end },
      filters: { contractId, supplierId },
      note: 'This would return aggregated financial impact of contract performance',
    };
  }

  @Post('reports/bulk-generate')
  @ApiOperation({ summary: 'Generate reports for multiple contracts' })
  @ApiResponse({ status: 200, description: 'Bulk report generation initiated' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async generateBulkReports(
    @Body()
    reportRequest: {
      contractIds: string[];
      startDate?: string;
      endDate?: string;
      includeProductDetails?: boolean;
      emailTo?: string[];
    }
  ) {
    // This would generate reports for multiple contracts
    return {
      message: 'Bulk report generation endpoint',
      request: reportRequest,
      note: 'This would generate and optionally email performance reports for multiple contracts',
    };
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get performance alerts and notifications' })
  @ApiResponse({ status: 200, description: 'Performance alerts retrieved' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getPerformanceAlerts(
    @Query('severity') severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    @Query('unreadOnly', new DefaultValuePipe(false)) unreadOnly: boolean = false,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number = 50
  ) {
    // This would return recent performance alerts
    return {
      message: 'Performance alerts endpoint',
      filters: { severity, unreadOnly, limit },
      note: 'This would return recent alerts about contract performance issues',
    };
  }

  @Put('alerts/:id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge a performance alert' })
  @ApiResponse({ status: 200, description: 'Alert acknowledged successfully' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async acknowledgeAlert(@Param('id', ParseUUIDPipe) alertId: string, @Body('notes') notes?: string) {
    // This would mark an alert as acknowledged
    return {
      message: 'Alert acknowledgment endpoint',
      alertId,
      notes,
      acknowledgedAt: new Date(),
      note: 'This would mark the alert as read/acknowledged by the manager',
    };
  }

  @Get('export')
  @ApiOperation({ summary: 'Export performance data' })
  @ApiResponse({ status: 200, description: 'Performance data export' })
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async exportPerformanceData(
    @Query('format') format: 'json' | 'csv' | 'xlsx' = 'json',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('contractIds') contractIds?: string
  ) {
    // This would export performance data in requested format
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    const contracts = contractIds ? contractIds.split(',') : [];

    return {
      message: 'Performance data export endpoint',
      format,
      period: { start, end },
      contractIds: contracts,
      note: 'This would generate and return performance data in the requested format',
    };
  }
}
