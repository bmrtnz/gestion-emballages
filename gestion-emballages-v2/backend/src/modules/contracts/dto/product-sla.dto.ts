import {
  IsBoolean,
  IsDateString,
  IsDecimal,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateProductSLADto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Delivery SLA in days (overrides contract default)', required: false })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  deliverySLADays?: number;

  @ApiProperty({ description: 'Delivery tolerance percentage', required: false })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  deliveryTolerancePercent?: number;

  @ApiProperty({ description: 'Maximum delivery delay days', required: false })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  maxDeliveryDelayDays?: number;

  @ApiProperty({ description: 'Quality tolerance percentage', required: false })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  qualityTolerancePercent?: number;

  @ApiProperty({ description: 'Maximum quality defect rate percentage', required: false })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  maxQualityDefectRate?: number;

  @ApiProperty({ description: 'Critical quality threshold percentage', required: false })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  criticalQualityThreshold?: number;

  @ApiProperty({ description: 'Quantity accuracy threshold percentage', required: false })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  quantityAccuracyThreshold?: number;

  @ApiProperty({ description: 'Packaging compliance rate percentage', required: false })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  packagingComplianceRate?: number;

  @ApiProperty({ description: 'Late delivery penalty percentage (overrides contract default)', required: false })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  lateDeliveryPenaltyPercent?: number;

  @ApiProperty({ description: 'Quality issue penalty percentage (overrides contract default)', required: false })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  qualityIssuePenaltyPercent?: number;

  @ApiProperty({ description: 'Quantity shortage penalty percentage', required: false })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  quantityShortagePenaltyPercent?: number;

  @ApiProperty({ description: 'Delivery excellence bonus percentage (overrides contract default)', required: false })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  deliveryExcellenceBonusPercent?: number;

  @ApiProperty({ description: 'Quality excellence bonus percentage (overrides contract default)', required: false })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  qualityExcellenceBonusPercent?: number;

  @ApiProperty({ description: 'Minimum order fulfillment rate percentage', required: false, default: 95.0 })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Transform(({ value }) => parseFloat(value))
  minimumOrderFulfillmentRate?: number;

  @ApiProperty({ description: 'Maximum response time in hours', required: false })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  maximumResponseTimeHours?: number;

  @ApiProperty({ description: 'Required lead time in days', required: false })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  requiredLeadTimeDays?: number;

  @ApiProperty({ description: 'Seasonal adjustments configuration', required: false })
  @IsOptional()
  @IsObject()
  seasonalAdjustments?: {
    peakSeason?: {
      months: number[];
      deliverySLAAdjustment?: number;
      qualityToleranceAdjustment?: number;
    };
    offPeakSeason?: {
      months: number[];
      deliverySLAAdjustment?: number;
      qualityToleranceAdjustment?: number;
    };
    specialPeriods?: Array<{
      name: string;
      startDate: string;
      endDate: string;
      adjustments: Record<string, number>;
    }>;
  };

  @ApiProperty({ description: 'Special requirements for this product', required: false })
  @IsOptional()
  @IsObject()
  specialRequirements?: {
    temperatureRange?: { min: number; max: number };
    fragileHandling?: boolean;
    specialPackaging?: boolean;
    certificationRequired?: boolean;
    traceabilityRequired?: boolean;
    deliveryTimeWindows?: Array<{ start: string; end: string }>;
    specialDeliveryInstructions?: string;
    mandatoryInspection?: boolean;
    sampleTestingRequired?: boolean;
  };

  @ApiProperty({ description: 'Escalation rules configuration', required: false })
  @IsOptional()
  @IsObject()
  escalationRules?: {
    immediateEscalation?: {
      deliveryDelay?: number;
      qualityIssueRate?: number;
      quantityShortage?: number;
    };
    notifications?: {
      warningThreshold?: number;
      escalationThreshold?: number;
      criticalThreshold?: number;
    };
    reviewTriggers?: {
      consecutiveBreaches?: number;
      cumulativePenalties?: number;
      qualityIncidents?: number;
    };
  };

  @ApiProperty({ description: 'Measurement period in days', required: false, default: 30 })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  measurementPeriodDays?: number;

  @ApiProperty({ description: 'Grace period in days before penalties apply', required: false, default: 5 })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  gracePeriodDays?: number;

  @ApiProperty({ description: 'SLA effective from date' })
  @IsDateString()
  effectiveFrom: string;

  @ApiProperty({ description: 'SLA effective until date', required: false })
  @IsOptional()
  @IsDateString()
  effectiveUntil?: string;

  @ApiProperty({ description: 'Review notes', required: false })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}

export class UpdateProductSLADto extends PartialType(CreateProductSLADto) {
  @ApiProperty({ description: 'Suspend SLA enforcement', required: false })
  @IsOptional()
  @IsBoolean()
  isSuspended?: boolean;

  @ApiProperty({ description: 'Suspension reason', required: false })
  @IsOptional()
  @IsString()
  suspensionReason?: string;

  @ApiProperty({ description: 'Last reviewed date', required: false })
  @IsOptional()
  @IsDateString()
  lastReviewedAt?: string;

  @ApiProperty({ description: 'Last reviewed by user ID', required: false })
  @IsOptional()
  @IsUUID()
  lastReviewedBy?: string;
}

export class ProductSLAFiltersDto {
  @ApiProperty({ description: 'Filter by product ID', required: false })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiProperty({ description: 'Show only active SLAs', required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  activeOnly?: boolean;

  @ApiProperty({ description: 'Show only suspended SLAs', required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  suspendedOnly?: boolean;

  @ApiProperty({ description: 'Show only currently effective SLAs', required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  currentlyEffective?: boolean;

  @ApiProperty({ description: 'Show only SLAs with special requirements', required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  hasSpecialRequirements?: boolean;

  @ApiProperty({ description: 'Show only SLAs with seasonal adjustments', required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  hasSeasonalAdjustments?: boolean;

  @ApiProperty({ description: 'Show only SLAs with escalation rules', required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  hasEscalationRules?: boolean;

  @ApiProperty({ description: 'Filter by effective from date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  effectiveFromStart?: string;

  @ApiProperty({ description: 'Filter by effective from date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  effectiveFromEnd?: string;

  @ApiProperty({ description: 'Filter by effective until date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  effectiveUntilStart?: string;

  @ApiProperty({ description: 'Filter by effective until date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  effectiveUntilEnd?: string;

  @ApiProperty({ description: 'Search in product names or SLA details', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ProductSLAResponseDto {
  @ApiProperty({ description: 'Product SLA ID' })
  id: string;

  @ApiProperty({ description: 'Master contract ID' })
  masterContractId: string;

  @ApiProperty({ description: 'Product information' })
  product: {
    id: string;
    name: string;
    category: string;
  };

  @ApiProperty({ description: 'Effective SLA values' })
  effectiveSLA: {
    deliverySLADays: number;
    qualityTolerancePercent: number;
    deliveryTolerancePercent: number;
  };

  @ApiProperty({ description: 'Custom overrides (null if using contract defaults)' })
  overrides: {
    deliverySLADays?: number;
    qualityTolerancePercent?: number;
    deliveryTolerancePercent?: number;
    lateDeliveryPenaltyPercent?: number;
    qualityIssuePenaltyPercent?: number;
    deliveryExcellenceBonusPercent?: number;
    qualityExcellenceBonusPercent?: number;
  };

  @ApiProperty({ description: 'SLA status and validity' })
  status: {
    isCurrentlyEffective: boolean;
    isSuspended: boolean;
    suspensionReason?: string;
    effectiveFrom: Date;
    effectiveUntil?: Date;
    daysUntilExpiry?: number;
  };

  @ApiProperty({ description: 'Special configuration flags' })
  configuration: {
    hasSeasonalAdjustments: boolean;
    hasSpecialRequirements: boolean;
    hasEscalationRules: boolean;
    measurementPeriodDays: number;
    gracePeriodDays: number;
  };

  @ApiProperty({ description: 'Recent performance summary', required: false })
  recentPerformance?: {
    lastCalculatedAt?: Date;
    deliveryPerformance?: number;
    qualityPerformance?: number;
    quantityAccuracy?: number;
    overallScore?: number;
    status?: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'BREACH' | 'CRITICAL';
  };

  @ApiProperty({ description: 'Audit information' })
  audit: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastReviewedAt?: Date;
    lastReviewedBy?: string;
    reviewNotes?: string;
  };
}

export class ProductSLABulkUpdateDto {
  @ApiProperty({ description: 'Product SLA IDs to update' })
  @IsUUID(4, { each: true })
  slaIds: string[];

  @ApiProperty({ description: 'Updates to apply to all selected SLAs' })
  @IsObject()
  updates: Partial<UpdateProductSLADto>;

  @ApiProperty({ description: 'Reason for bulk update' })
  @IsString()
  reason: string;
}

export class ProductSLATemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Template description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Product category this template applies to' })
  @IsOptional()
  @IsString()
  productCategory?: string;

  @ApiProperty({ description: 'Template SLA configuration' })
  @IsObject()
  template: Omit<CreateProductSLADto, 'productId' | 'effectiveFrom'>;
}
