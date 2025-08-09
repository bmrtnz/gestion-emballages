import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { MasterContract } from './master-contract.entity';
import { ContractProductSLA } from './contract-product-sla.entity';
import { PurchaseOrder } from '@modules/orders/entities/purchase-order.entity';
import { Product } from '@modules/products/entities/product.entity';

export enum MetricType {
  DELIVERY_PERFORMANCE = 'DELIVERY_PERFORMANCE',
  QUALITY_PERFORMANCE = 'QUALITY_PERFORMANCE',
  QUANTITY_ACCURACY = 'QUANTITY_ACCURACY',
  PACKAGING_COMPLIANCE = 'PACKAGING_COMPLIANCE',
  DOCUMENTATION_COMPLETENESS = 'DOCUMENTATION_COMPLETENESS',
  RESPONSE_TIME = 'RESPONSE_TIME',
  ORDER_FULFILLMENT_RATE = 'ORDER_FULFILLMENT_RATE'
}

export enum PerformanceStatus {
  EXCELLENT = 'EXCELLENT',    // Above expectations
  GOOD = 'GOOD',             // Meeting SLA
  WARNING = 'WARNING',        // Approaching SLA breach
  BREACH = 'BREACH',         // SLA breached
  CRITICAL = 'CRITICAL'      // Critical breach requiring escalation
}

export enum MeasurementPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUAL = 'ANNUAL'
}

@Entity('contract_performance_metrics')
export class ContractPerformanceMetric extends BaseEntity {
  @Column({ name: 'master_contract_id' })
  masterContractId: string;

  @Column({ name: 'product_sla_id', nullable: true })
  productSLAId?: string; // null for contract-level metrics

  @Column({ name: 'product_id', nullable: true })
  productId?: string; // null for contract-level metrics

  @Column({ name: 'purchase_order_id', nullable: true })
  purchaseOrderId?: string; // Specific order this metric relates to

  // Metric identification
  @Column({
    type: 'enum',
    enum: MetricType
  })
  metricType: MetricType;

  @Column({
    type: 'enum',
    enum: MeasurementPeriod,
    default: MeasurementPeriod.MONTHLY
  })
  measurementPeriod: MeasurementPeriod;

  // Time period for this metric
  @Column({ name: 'period_start', type: 'date' })
  periodStart: Date;

  @Column({ name: 'period_end', type: 'date' })
  periodEnd: Date;

  // Performance values
  @Column({ name: 'target_value', type: 'decimal', precision: 10, scale: 4 })
  targetValue: number; // The SLA target value

  @Column({ name: 'actual_value', type: 'decimal', precision: 10, scale: 4 })
  actualValue: number; // The actual measured value

  @Column({ name: 'variance', type: 'decimal', precision: 10, scale: 4 })
  variance: number; // Difference (actual - target)

  @Column({ name: 'variance_percent', type: 'decimal', precision: 10, scale: 4 })
  variancePercent: number; // (variance / target) * 100

  // Performance status
  @Column({
    type: 'enum',
    enum: PerformanceStatus
  })
  status: PerformanceStatus;

  // Measurement details
  @Column({ name: 'sample_size', type: 'int' })
  sampleSize: number; // Number of orders/events measured

  @Column({ name: 'total_events', type: 'int' })
  totalEvents: number; // Total number of applicable events in period

  @Column({ name: 'successful_events', type: 'int' })
  successfulEvents: number; // Number of events meeting SLA

  @Column({ name: 'failed_events', type: 'int' })
  failedEvents: number; // Number of events failing SLA

  // Financial impact
  @Column({ name: 'penalties_applied', type: 'decimal', precision: 12, scale: 2, default: 0 })
  penaltiesApplied: number; // Total penalties for this period

  @Column({ name: 'bonuses_earned', type: 'decimal', precision: 12, scale: 2, default: 0 })
  bonusesEarned: number; // Total bonuses for this period

  @Column({ name: 'net_financial_impact', type: 'decimal', precision: 12, scale: 2, default: 0 })
  netFinancialImpact: number; // bonuses - penalties

  @Column({ name: 'potential_order_value', type: 'decimal', precision: 12, scale: 2, nullable: true })
  potentialOrderValue?: number; // Total order value at risk

  // Trend analysis
  @Column({ name: 'trend_direction', type: 'varchar', length: 20, nullable: true })
  trendDirection?: 'IMPROVING' | 'STABLE' | 'DECLINING'; // Compared to previous period

  @Column({ name: 'previous_period_value', type: 'decimal', precision: 10, scale: 4, nullable: true })
  previousPeriodValue?: number; // For trend comparison

  @Column({ name: 'rolling_average_3m', type: 'decimal', precision: 10, scale: 4, nullable: true })
  rollingAverage3Months?: number; // 3-month rolling average

  @Column({ name: 'rolling_average_12m', type: 'decimal', precision: 10, scale: 4, nullable: true })
  rollingAverage12Months?: number; // 12-month rolling average

  // Detailed breakdown
  @Column({ name: 'performance_breakdown', type: 'jsonb', default: {} })
  performanceBreakdown: {
    // Delivery performance details
    deliveryMetrics?: {
      averageDeliveryTime?: number;
      onTimeDeliveries?: number;
      lateDeliveries?: number;
      averageDelay?: number;
      maxDelay?: number;
      earlyDeliveries?: number;
      averageEarlyTime?: number;
    };
    
    // Quality performance details
    qualityMetrics?: {
      qualityIssuesReported?: number;
      defectRate?: number;
      customerComplaints?: number;
      certificationCompliance?: number;
      returnRate?: number;
      reworkRequired?: number;
    };
    
    // Quantity accuracy details
    quantityMetrics?: {
      shortDeliveries?: number;
      overDeliveries?: number;
      exactDeliveries?: number;
      averageVariance?: number;
      maxVariance?: number;
    };
    
    // Response time details
    responseMetrics?: {
      averageResponseTime?: number;
      withinSLAResponses?: number;
      lateResponses?: number;
      maxResponseTime?: number;
    };
  };

  // Root cause analysis
  @Column({ name: 'root_causes', type: 'jsonb', default: {} })
  rootCauses: {
    // Common root cause categories
    supplierIssues?: string[];
    logisticsIssues?: string[];
    qualityControlIssues?: string[];
    communicationIssues?: string[];
    externalFactors?: string[];
    systemIssues?: string[];
    
    // Corrective actions taken
    correctiveActions?: Array<{
      issue: string;
      action: string;
      implementedDate: string;
      expectedImpact: string;
      status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    }>;
  };

  // Escalation tracking
  @Column({ name: 'escalation_level', type: 'int', default: 0 })
  escalationLevel: number; // 0=none, 1=warning, 2=minor, 3=major, 4=critical

  @Column({ name: 'escalation_triggered', type: 'boolean', default: false })
  escalationTriggered: boolean;

  @Column({ name: 'escalation_date', type: 'timestamp', nullable: true })
  escalationDate?: Date;

  @Column({ name: 'escalation_notes', type: 'text', nullable: true })
  escalationNotes?: string;

  // Review and approval
  @Column({ name: 'is_reviewed', type: 'boolean', default: false })
  isReviewed: boolean;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy?: string;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @Column({ name: 'review_notes', type: 'text', nullable: true })
  reviewNotes?: string;

  @Column({ name: 'requires_action', type: 'boolean', default: false })
  requiresAction: boolean;

  @Column({ name: 'action_plan', type: 'text', nullable: true })
  actionPlan?: string;

  @Column({ name: 'action_deadline', type: 'date', nullable: true })
  actionDeadline?: Date;

  // Data quality and validation
  @Column({ name: 'calculation_method', type: 'varchar', length: 100 })
  calculationMethod: string; // How this metric was calculated

  @Column({ name: 'data_sources', type: 'jsonb', default: [] })
  dataSources: string[]; // Which systems/tables provided the data

  @Column({ name: 'calculation_timestamp', type: 'timestamp' })
  calculationTimestamp: Date; // When this metric was calculated

  @Column({ name: 'is_estimated', type: 'boolean', default: false })
  isEstimated: boolean; // Whether this metric contains estimated values

  @Column({ name: 'confidence_level', type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidenceLevel?: number; // Statistical confidence level (0-100%)

  // Audit fields
  @Column({ name: 'calculated_by' })
  calculatedById: string;

  // Relations
  @ManyToOne(() => MasterContract, (contract) => contract.performanceMetrics)
  @JoinColumn({ name: 'master_contract_id' })
  masterContract: MasterContract;

  @ManyToOne(() => ContractProductSLA, { nullable: true })
  @JoinColumn({ name: 'product_sla_id' })
  productSLA?: ContractProductSLA;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'product_id' })
  product?: Product;

  @ManyToOne(() => PurchaseOrder, { nullable: true })
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder?: PurchaseOrder;

  // Virtual properties
  get performanceScore(): number {
    // Calculate a 0-100 performance score
    if (this.targetValue === 0) return 100;
    
    const score = (this.actualValue / this.targetValue) * 100;
    return Math.max(0, Math.min(100, score));
  }

  get isWithinSLA(): boolean {
    switch (this.metricType) {
      case MetricType.DELIVERY_PERFORMANCE:
      case MetricType.ORDER_FULFILLMENT_RATE:
      case MetricType.PACKAGING_COMPLIANCE:
      case MetricType.DOCUMENTATION_COMPLETENESS:
        // For these metrics, higher is better
        return this.actualValue >= this.targetValue;
      
      case MetricType.RESPONSE_TIME:
        // For response time, lower is better
        return this.actualValue <= this.targetValue;
      
      case MetricType.QUALITY_PERFORMANCE:
      case MetricType.QUANTITY_ACCURACY:
        // For these, depends on what's being measured (usually higher is better)
        return this.actualValue >= this.targetValue;
      
      default:
        return this.actualValue >= this.targetValue;
    }
  }

  get severityLevel(): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const varianceAbs = Math.abs(this.variancePercent);
    
    if (this.isWithinSLA) {
      return 'LOW';
    } else if (varianceAbs <= 10) {
      return 'MEDIUM';
    } else if (varianceAbs <= 25) {
      return 'HIGH';
    } else {
      return 'CRITICAL';
    }
  }

  get isOverdue(): boolean {
    return this.requiresAction && this.actionDeadline && new Date() > this.actionDeadline;
  }

  get periodDurationDays(): number {
    return Math.ceil((this.periodEnd.getTime() - this.periodStart.getTime()) / (1000 * 60 * 60 * 24));
  }

  get successRate(): number {
    if (this.totalEvents === 0) return 0;
    return (this.successfulEvents / this.totalEvents) * 100;
  }

  get failureRate(): number {
    if (this.totalEvents === 0) return 0;
    return (this.failedEvents / this.totalEvents) * 100;
  }

  // Helper methods
  calculateFinancialImpact(baseOrderValue: number): void {
    // This would be called to update financial impact based on performance
    this.netFinancialImpact = this.bonusesEarned - this.penaltiesApplied;
  }

  updateTrend(previousMetric?: ContractPerformanceMetric): void {
    if (!previousMetric) {
      this.trendDirection = 'STABLE';
      return;
    }

    this.previousPeriodValue = previousMetric.actualValue;
    
    const changePercent = ((this.actualValue - previousMetric.actualValue) / previousMetric.actualValue) * 100;
    
    if (Math.abs(changePercent) < 5) {
      this.trendDirection = 'STABLE';
    } else {
      // For metrics where higher is better
      switch (this.metricType) {
        case MetricType.DELIVERY_PERFORMANCE:
        case MetricType.ORDER_FULFILLMENT_RATE:
        case MetricType.QUALITY_PERFORMANCE:
        case MetricType.QUANTITY_ACCURACY:
        case MetricType.PACKAGING_COMPLIANCE:
        case MetricType.DOCUMENTATION_COMPLETENESS:
          this.trendDirection = changePercent > 0 ? 'IMPROVING' : 'DECLINING';
          break;
        
        case MetricType.RESPONSE_TIME:
          // For response time, lower is better
          this.trendDirection = changePercent < 0 ? 'IMPROVING' : 'DECLINING';
          break;
        
        default:
          this.trendDirection = changePercent > 0 ? 'IMPROVING' : 'DECLINING';
      }
    }
  }

  shouldEscalate(): boolean {
    return !this.isWithinSLA && 
           (this.severityLevel === 'HIGH' || this.severityLevel === 'CRITICAL') &&
           !this.escalationTriggered;
  }

  triggerEscalation(notes?: string): void {
    if (!this.shouldEscalate()) return;
    
    this.escalationTriggered = true;
    this.escalationDate = new Date();
    this.escalationNotes = notes;
    this.requiresAction = true;
    
    // Set escalation level based on severity
    switch (this.severityLevel) {
      case 'HIGH':
        this.escalationLevel = 3;
        break;
      case 'CRITICAL':
        this.escalationLevel = 4;
        break;
      default:
        this.escalationLevel = 2;
    }
  }

  getPerformanceSummary(): string {
    const status = this.isWithinSLA ? 'MEETING' : 'MISSING';
    const variance = this.variancePercent > 0 ? '+' : '';
    
    return `${this.metricType}: ${status} SLA (${this.actualValue} vs ${this.targetValue}, ${variance}${this.variancePercent.toFixed(1)}%)`;
  }
}