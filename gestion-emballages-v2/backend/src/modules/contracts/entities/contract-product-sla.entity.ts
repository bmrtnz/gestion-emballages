import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { MasterContract } from './master-contract.entity';
import { Product } from '@modules/products/entities/product.entity';

export enum SLAMetricType {
  DELIVERY_TIME = 'DELIVERY_TIME',
  QUALITY_CONFORMITY = 'QUALITY_CONFORMITY',
  QUANTITY_ACCURACY = 'QUANTITY_ACCURACY',
  PACKAGING_COMPLIANCE = 'PACKAGING_COMPLIANCE',
  DOCUMENTATION_COMPLETENESS = 'DOCUMENTATION_COMPLETENESS'
}

export enum SLASeverityLevel {
  WARNING = 'WARNING',     // Minor deviation, no penalty
  MINOR = 'MINOR',         // Small penalty
  MAJOR = 'MAJOR',         // Significant penalty
  CRITICAL = 'CRITICAL'    // Contract review trigger
}

@Entity('contract_product_slas')
export class ContractProductSLA extends BaseEntity {
  @Column({ name: 'master_contract_id' })
  masterContractId: string;

  @Column({ name: 'product_id' })
  productId: string;

  // Delivery SLA overrides
  @Column({ name: 'delivery_sla_days', type: 'int', nullable: true })
  deliverySLADays?: number; // Override master contract default

  @Column({ name: 'delivery_tolerance_percent', type: 'decimal', precision: 5, scale: 2, nullable: true })
  deliveryTolerancePercent?: number; // % of orders allowed to be late

  @Column({ name: 'max_delivery_delay_days', type: 'int', nullable: true })
  maxDeliveryDelayDays?: number; // Maximum acceptable delay before critical breach

  // Quality SLA overrides
  @Column({ name: 'quality_tolerance_percent', type: 'decimal', precision: 5, scale: 2, nullable: true })
  qualityTolerancePercent?: number; // % of orders allowed to have quality issues

  @Column({ name: 'max_quality_defect_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxQualityDefectRate?: number; // Maximum acceptable defect rate (% of units)

  @Column({ name: 'critical_quality_threshold', type: 'decimal', precision: 5, scale: 2, nullable: true })
  criticalQualityThreshold?: number; // Defect rate that triggers immediate escalation

  // Quantity and packaging SLAs
  @Column({ name: 'quantity_accuracy_threshold', type: 'decimal', precision: 5, scale: 2, nullable: true })
  quantityAccuracyThreshold?: number; // Minimum acceptable quantity accuracy (%)

  @Column({ name: 'packaging_compliance_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  packagingComplianceRate?: number; // Required packaging compliance rate (%)

  // Performance penalties (override master contract)
  @Column({ name: 'late_delivery_penalty_percent', type: 'decimal', precision: 5, scale: 2, nullable: true })
  lateDeliveryPenaltyPercent?: number; // % penalty per day late

  @Column({ name: 'quality_issue_penalty_percent', type: 'decimal', precision: 5, scale: 2, nullable: true })
  qualityIssuePenaltyPercent?: number; // % penalty for quality issues

  @Column({ name: 'quantity_shortage_penalty_percent', type: 'decimal', precision: 5, scale: 2, nullable: true })
  quantityShortagePenaltyPercent?: number; // % penalty for quantity shortages

  // Performance bonuses
  @Column({ name: 'early_delivery_bonus_percent', type: 'decimal', precision: 5, scale: 2, nullable: true })
  earlyDeliveryBonusPercent?: number; // % bonus for early delivery

  @Column({ name: 'quality_excellence_bonus_percent', type: 'decimal', precision: 5, scale: 2, nullable: true })
  qualityExcellenceBonusPercent?: number; // % bonus for zero quality issues

  // Service level requirements
  @Column({ name: 'minimum_order_fulfillment_rate', type: 'decimal', precision: 5, scale: 2, default: 95.0 })
  minimumOrderFulfillmentRate: number; // Required order fulfillment rate (%)

  @Column({ name: 'maximum_response_time_hours', type: 'int', nullable: true })
  maximumResponseTimeHours?: number; // Max response time for order confirmations

  @Column({ name: 'required_lead_time_days', type: 'int', nullable: true })
  requiredLeadTimeDays?: number; // Standard lead time for this product

  // Seasonal adjustments
  @Column({ name: 'seasonal_adjustments', type: 'jsonb', default: {} })
  seasonalAdjustments: {
    // Allow different SLAs during peak/off-peak seasons
    peakSeason?: {
      months: number[]; // [1,2,3] for Jan-Mar
      deliverySLAAdjustment?: number; // Additional days during peak
      qualityToleranceAdjustment?: number; // Relaxed tolerance during peak
    };
    offPeakSeason?: {
      months: number[];
      deliverySLAAdjustment?: number; // Reduced days during off-peak
      qualityToleranceAdjustment?: number; // Stricter tolerance during off-peak
    };
    specialPeriods?: Array<{
      name: string;
      startDate: string;
      endDate: string;
      adjustments: Record<string, number>;
    }>;
  };

  // Product-specific requirements
  @Column({ name: 'special_requirements', type: 'jsonb', default: {} })
  specialRequirements: {
    // Cold chain requirements
    temperatureRange?: { min: number; max: number };
    
    // Handling requirements
    fragileHandling?: boolean;
    specialPackaging?: boolean;
    
    // Documentation requirements
    certificationRequired?: boolean;
    traceabilityRequired?: boolean;
    
    // Delivery constraints
    deliveryTimeWindows?: Array<{ start: string; end: string }>;
    specialDeliveryInstructions?: string;
    
    // Quality checks
    mandatoryInspection?: boolean;
    sampleTestingRequired?: boolean;
  };

  // Escalation rules
  @Column({ name: 'escalation_rules', type: 'jsonb', default: {} })
  escalationRules: {
    // Automatic escalation thresholds
    immediateEscalation?: {
      deliveryDelay?: number; // Days
      qualityIssueRate?: number; // %
      quantityShortage?: number; // %
    };
    
    // Notification rules
    notifications?: {
      warningThreshold?: number;
      escalationThreshold?: number;
      criticalThreshold?: number;
    };
    
    // Contract review triggers
    reviewTriggers?: {
      consecutiveBreaches?: number;
      cumulativePenalties?: number; // Total penalties amount
      qualityIncidents?: number; // Number of incidents in period
    };
  };

  // Measurement period settings
  @Column({ name: 'measurement_period_days', type: 'int', default: 30 })
  measurementPeriodDays: number; // Period for measuring SLA performance

  @Column({ name: 'grace_period_days', type: 'int', default: 5 })
  gracePeriodDays: number; // Grace period before penalties apply

  // Status and validity
  @Column({ name: 'effective_from', type: 'date' })
  effectiveFrom: Date;

  @Column({ name: 'effective_until', type: 'date', nullable: true })
  effectiveUntil?: Date;

  @Column({ name: 'is_suspended', type: 'boolean', default: false })
  isSuspended: boolean; // Temporarily suspend SLA enforcement

  @Column({ name: 'suspension_reason', type: 'text', nullable: true })
  suspensionReason?: string;

  // Audit fields
  @Column({ name: 'created_by' })
  createdById: string;

  @Column({ name: 'last_reviewed_at', type: 'timestamp', nullable: true })
  lastReviewedAt?: Date;

  @Column({ name: 'last_reviewed_by', nullable: true })
  lastReviewedBy?: string;

  @Column({ name: 'review_notes', type: 'text', nullable: true })
  reviewNotes?: string;

  // Relations
  @ManyToOne(() => MasterContract, (contract) => contract.productSLAs)
  @JoinColumn({ name: 'master_contract_id' })
  masterContract: MasterContract;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  // Virtual properties
  get isCurrentlyEffective(): boolean {
    const now = new Date();
    return this.effectiveFrom <= now && 
           (!this.effectiveUntil || this.effectiveUntil >= now) &&
           !this.isSuspended &&
           this.isActive;
  }

  get hasSeasonalAdjustments(): boolean {
    return Object.keys(this.seasonalAdjustments).length > 0;
  }

  get hasSpecialRequirements(): boolean {
    return Object.keys(this.specialRequirements).length > 0;
  }

  get hasEscalationRules(): boolean {
    return Object.keys(this.escalationRules).length > 0;
  }

  // Helper methods for SLA calculations
  getEffectiveDeliverySLA(forDate?: Date): number {
    const checkDate = forDate || new Date();
    const month = checkDate.getMonth() + 1;
    
    let baseSLA = this.deliverySLADays || this.masterContract?.defaultDeliverySLADays || 7;
    
    // Apply seasonal adjustments
    if (this.seasonalAdjustments?.peakSeason?.months?.includes(month)) {
      baseSLA += this.seasonalAdjustments.peakSeason.deliverySLAAdjustment || 0;
    } else if (this.seasonalAdjustments?.offPeakSeason?.months?.includes(month)) {
      baseSLA += this.seasonalAdjustments.offPeakSeason.deliverySLAAdjustment || 0;
    }
    
    return baseSLA;
  }

  getEffectiveQualityTolerance(forDate?: Date): number {
    const checkDate = forDate || new Date();
    const month = checkDate.getMonth() + 1;
    
    let baseTolerance = this.qualityTolerancePercent || this.masterContract?.defaultQualityTolerancePercent || 2.0;
    
    // Apply seasonal adjustments
    if (this.seasonalAdjustments?.peakSeason?.months?.includes(month)) {
      baseTolerance += this.seasonalAdjustments.peakSeason.qualityToleranceAdjustment || 0;
    } else if (this.seasonalAdjustments?.offPeakSeason?.months?.includes(month)) {
      baseTolerance += this.seasonalAdjustments.offPeakSeason.qualityToleranceAdjustment || 0;
    }
    
    return Math.max(0, baseTolerance); // Never go below 0%
  }

  shouldEscalateImmediately(violation: {
    type: 'DELIVERY' | 'QUALITY' | 'QUANTITY';
    value: number;
  }): boolean {
    const rules = this.escalationRules?.immediateEscalation;
    if (!rules) return false;
    
    switch (violation.type) {
      case 'DELIVERY':
        return violation.value >= (rules.deliveryDelay || Infinity);
      case 'QUALITY':
        return violation.value >= (rules.qualityIssueRate || Infinity);
      case 'QUANTITY':
        return violation.value >= (rules.quantityShortage || Infinity);
      default:
        return false;
    }
  }

  calculatePenalty(violation: {
    type: 'DELIVERY' | 'QUALITY' | 'QUANTITY';
    value: number;
    orderValue: number;
  }): number {
    let penaltyRate = 0;
    
    switch (violation.type) {
      case 'DELIVERY':
        penaltyRate = this.lateDeliveryPenaltyPercent || this.masterContract?.lateDeliveryPenaltyPercent || 0.5;
        break;
      case 'QUALITY':
        penaltyRate = this.qualityIssuePenaltyPercent || this.masterContract?.qualityIssuePenaltyPercent || 1.0;
        break;
      case 'QUANTITY':
        penaltyRate = this.quantityShortagePenaltyPercent || 2.0; // Default 2% for quantity issues
        break;
    }
    
    return (violation.orderValue * penaltyRate * violation.value) / 100;
  }

  calculateBonus(performance: {
    type: 'EARLY_DELIVERY' | 'QUALITY_EXCELLENCE';
    value: number;
    orderValue: number;
  }): number {
    let bonusRate = 0;
    
    switch (performance.type) {
      case 'EARLY_DELIVERY':
        bonusRate = this.earlyDeliveryBonusPercent || this.masterContract?.earlyDeliveryBonusPercent || 0;
        break;
      case 'QUALITY_EXCELLENCE':
        bonusRate = this.qualityExcellenceBonusPercent || this.masterContract?.qualityExcellenceBonusPercent || 0;
        break;
    }
    
    return (performance.orderValue * bonusRate * performance.value) / 100;
  }
}