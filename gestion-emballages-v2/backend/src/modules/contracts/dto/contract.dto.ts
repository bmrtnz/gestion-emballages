import { IsString, IsUUID, IsEnum, IsOptional, IsDecimal, IsInt, IsDateString, IsBoolean, ValidateNested, IsObject } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationDto } from '@common/dto/pagination.dto';
import { ContractType, ContractStatus } from '../entities/master-contract.entity';

export class CreateContractDto {
  @ApiProperty({ description: 'Unique contract number' })
  @IsString()
  contractNumber: string;

  @ApiProperty({ description: 'Contract name/title' })
  @IsString()
  contractName: string;

  @ApiProperty({ description: 'Supplier ID' })
  @IsUUID()
  supplierId: string;

  @ApiProperty({ enum: ContractType, description: 'Type of contract' })
  @IsEnum(ContractType)
  contractType: ContractType;

  @ApiProperty({ description: 'Contract valid from date' })
  @IsDateString()
  validFrom: string;

  @ApiProperty({ description: 'Contract valid until date' })
  @IsDateString()
  validUntil: string;

  @ApiProperty({ description: 'Contract description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Payment terms', required: false })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiProperty({ description: 'Delivery terms', required: false })
  @IsOptional()
  @IsString()
  deliveryTerms?: string;

  @ApiProperty({ description: 'Default delivery SLA in days', required: false, default: 7 })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  defaultDeliverySLADays?: number;

  @ApiProperty({ description: 'Default quality tolerance percentage', required: false, default: 2.0 })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  defaultQualityTolerancePercent?: number;

  @ApiProperty({ description: 'Default delivery tolerance percentage', required: false, default: 5.0 })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  defaultDeliveryTolerancePercent?: number;

  @ApiProperty({ description: 'Volume commitment', required: false })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  volumeCommitment?: number;

  @ApiProperty({ description: 'Minimum order value', required: false })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  minimumOrderValue?: number;

  @ApiProperty({ description: 'Currency code', required: false, default: 'EUR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Late delivery penalty percentage', required: false, default: 0.5 })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  lateDeliveryPenaltyPercent?: number;

  @ApiProperty({ description: 'Quality issue penalty percentage', required: false, default: 1.0 })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  qualityIssuePenaltyPercent?: number;

  @ApiProperty({ description: 'Early delivery bonus percentage', required: false, default: 0.0 })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  earlyDeliveryBonusPercent?: number;

  @ApiProperty({ description: 'Quality excellence bonus percentage', required: false, default: 0.0 })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  qualityExcellenceBonusPercent?: number;

  @ApiProperty({ description: 'Contract metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: {
    negotiatedBy?: string;
    negotiationNotes?: string[];
    criticalQualityThreshold?: number;
    criticalDeliveryThreshold?: number;
    autoRenewalClause?: boolean;
    renewalNoticeDays?: number;
    forceMAjeureClause?: boolean;
    qualityGuarantee?: boolean;
    exclusiveSupplier?: boolean;
    customClauses?: Record<string, any>;
  };

  @ApiProperty({ description: 'Next review date', required: false })
  @IsOptional()
  @IsDateString()
  nextReviewDate?: string;
}

export class UpdateContractDto extends PartialType(CreateContractDto) {
  @ApiProperty({ description: 'Contract status', required: false })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @ApiProperty({ description: 'Last reviewed date', required: false })
  @IsOptional()
  @IsDateString()
  lastReviewedAt?: string;

  @ApiProperty({ description: 'Review notes', required: false })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}

export class ContractFiltersDto extends PaginationDto {
  @ApiProperty({ description: 'Filter by contract number', required: false })
  @IsOptional()
  @IsString()
  contractNumber?: string;

  @ApiProperty({ description: 'Filter by contract name', required: false })
  @IsOptional()
  @IsString()
  contractName?: string;

  @ApiProperty({ description: 'Filter by supplier ID', required: false })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiProperty({ enum: ContractType, description: 'Filter by contract type', required: false })
  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @ApiProperty({ enum: ContractStatus, description: 'Filter by contract status', required: false })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @ApiProperty({ description: 'Filter by valid from date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  validFromStart?: string;

  @ApiProperty({ description: 'Filter by valid from date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  validFromEnd?: string;

  @ApiProperty({ description: 'Filter by valid until date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  validUntilStart?: string;

  @ApiProperty({ description: 'Filter by valid until date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  validUntilEnd?: string;

  @ApiProperty({ description: 'Show only active contracts', required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  activeOnly?: boolean;

  @ApiProperty({ description: 'Show only expiring contracts', required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  expiringOnly?: boolean;

  @ApiProperty({ description: 'Days until expiration for expiring filter', required: false })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  expiringDays?: number;

  @ApiProperty({ description: 'Show only contracts requiring review', required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  requiresReview?: boolean;

  @ApiProperty({ description: 'Currency filter', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Search in contract number, name, or description', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ContractSummaryDto {
  @ApiProperty({ description: 'Basic contract information' })
  contract: {
    id: string;
    contractNumber: string;
    contractName: string;
    status: ContractStatus;
    contractType: ContractType;
    validFrom: Date;
    validUntil: Date;
    isActive: boolean;
    isExpiringSoon: boolean;
    remainingDays: number;
  };

  @ApiProperty({ description: 'Supplier information' })
  supplier: {
    id: string;
    name: string;
    siret?: string;
    isActive: boolean;
  };

  @ApiProperty({ description: 'Contract performance summary' })
  performance: {
    overallScore: number;
    deliveryPerformance: number;
    qualityPerformance: number;
    lastCalculatedAt?: Date;
    totalPenalties: number;
    totalBonuses: number;
    netFinancialImpact: number;
  };

  @ApiProperty({ description: 'Product SLA summary' })
  productSLAs: {
    totalCount: number;
    activeCount: number;
    suspendedCount: number;
    productsWithCustomSLAs: number;
  };

  @ApiProperty({ description: 'Recent alerts and escalations' })
  alerts: {
    pendingEscalations: number;
    criticalMetrics: number;
    lastEscalationDate?: Date;
    requiresAction: boolean;
  };

  @ApiProperty({ description: 'Financial terms summary' })
  financials: {
    currency: string;
    volumeCommitment?: number;
    minimumOrderValue?: number;
    defaultPenaltyRates: {
      lateDelivery: number;
      qualityIssue: number;
    };
    defaultBonusRates: {
      earlyDelivery: number;
      qualityExcellence: number;
    };
  };
}

export class ContractValidationDto {
  @ApiProperty({ description: 'Validation results' })
  isValid: boolean;

  @ApiProperty({ description: 'Validation errors and warnings' })
  issues: Array<{
    type: 'ERROR' | 'WARNING' | 'INFO';
    code: string;
    message: string;
    field?: string;
    value?: any;
    suggestion?: string;
  }>;

  @ApiProperty({ description: 'SLA conflicts' })
  slaConflicts: Array<{
    productId: string;
    productName: string;
    conflictType: 'OVERLAPPING_PERIODS' | 'CONTRADICTORY_TERMS' | 'MISSING_REQUIREMENTS';
    description: string;
    affectedSLAs: string[];
    resolution: string;
  }>;

  @ApiProperty({ description: 'Performance thresholds analysis' })
  thresholdAnalysis: {
    deliverySLA: {
      min: number;
      max: number;
      average: number;
      outliers: string[];
    };
    qualityTolerance: {
      min: number;
      max: number;
      average: number;
      outliers: string[];
    };
    penalties: {
      totalPenaltyRate: number;
      highRiskProducts: string[];
    };
  };

  @ApiProperty({ description: 'Recommendations for improvement' })
  recommendations: string[];
}