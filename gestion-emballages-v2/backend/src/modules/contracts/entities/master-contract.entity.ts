import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Supplier } from '@modules/suppliers/entities/supplier.entity';
import { User } from '@modules/users/entities/user.entity';
import { ContractProductSLA } from './contract-product-sla.entity';
import { ContractPerformanceMetric } from './contract-performance-metric.entity';

export enum ContractStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED'
}

export enum ContractType {
  ANNUAL = 'ANNUAL',
  MULTI_YEAR = 'MULTI_YEAR',
  SEASONAL = 'SEASONAL',
  SPOT = 'SPOT'
}

@Entity('master_contracts')
export class MasterContract extends BaseEntity {
  @Column({ name: 'contract_number', unique: true, length: 100 })
  contractNumber: string;

  @Column({ name: 'contract_name', length: 255 })
  contractName: string;

  @Column({ name: 'supplier_id' })
  supplierId: string;

  @Column({
    type: 'enum',
    enum: ContractType,
    default: ContractType.ANNUAL
  })
  contractType: ContractType;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.DRAFT
  })
  status: ContractStatus;

  // Contract validity period
  @Column({ name: 'valid_from', type: 'date' })
  validFrom: Date;

  @Column({ name: 'valid_until', type: 'date' })
  validUntil: Date;

  // Contract terms
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'payment_terms', length: 255, nullable: true })
  paymentTerms?: string;

  @Column({ name: 'delivery_terms', length: 255, nullable: true })
  deliveryTerms?: string;

  // Global contract-level SLAs (can be overridden at product level)
  @Column({ name: 'default_delivery_sla_days', type: 'int', default: 7 })
  defaultDeliverySLADays: number;

  @Column({ name: 'default_quality_tolerance_percent', type: 'decimal', precision: 5, scale: 2, default: 2.0 })
  defaultQualityTolerancePercent: number; // % of orders that can have quality issues

  @Column({ name: 'default_delivery_tolerance_percent', type: 'decimal', precision: 5, scale: 2, default: 5.0 })
  defaultDeliveryTolerancePercent: number; // % of orders that can be late

  // Financial terms
  @Column({ name: 'volume_commitment', type: 'bigint', nullable: true })
  volumeCommitment?: number; // Total volume commitment for the contract period

  @Column({ name: 'minimum_order_value', type: 'decimal', precision: 12, scale: 2, nullable: true })
  minimumOrderValue?: number;

  @Column({ name: 'currency', length: 3, default: 'EUR' })
  currency: string;

  // Performance penalties and bonuses
  @Column({ name: 'late_delivery_penalty_percent', type: 'decimal', precision: 5, scale: 2, default: 0.5 })
  lateDeliveryPenaltyPercent: number; // % penalty per day late

  @Column({ name: 'quality_issue_penalty_percent', type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  qualityIssuePenaltyPercent: number; // % penalty for quality issues

  @Column({ name: 'early_delivery_bonus_percent', type: 'decimal', precision: 5, scale: 2, default: 0.0 })
  earlyDeliveryBonusPercent: number; // % bonus for early delivery

  @Column({ name: 'quality_excellence_bonus_percent', type: 'decimal', precision: 5, scale: 2, default: 0.0 })
  qualityExcellenceBonusPercent: number; // % bonus for zero quality issues

  // Contract metadata
  @Column({ type: 'jsonb', default: {} })
  metadata: {
    // Contract negotiation details
    negotiatedBy?: string;
    approvedBy?: string;
    negotiationNotes?: string[];
    approvalNotes?: string;
    reviewNotes?: string;
    
    // Performance thresholds
    criticalQualityThreshold?: number; // % that triggers contract review
    criticalDeliveryThreshold?: number; // % that triggers contract review
    
    // Renewal terms
    autoRenewalClause?: boolean;
    renewalNoticeDays?: number;
    renewalHistory?: Array<{
      renewedAt: string;
      renewedBy: string;
      previousValidUntil: string;
      newValidUntil: string;
      adjustments?: any;
    }>;
    
    // Special clauses
    forceMAjeureClause?: boolean;
    qualityGuarantee?: boolean;
    exclusiveSupplier?: boolean;
    
    // Suspension/Rejection details
    suspensionReason?: string;
    suspendedAt?: string;
    rejectionHistory?: Array<{
      rejectedAt: string;
      rejectedBy: string;
      reason: string;
    }>;
    
    // Custom fields
    customClauses?: Record<string, any>;
  };

  // Audit fields
  @Column({ name: 'created_by' })
  createdById: string;

  @Column({ name: 'approved_by', nullable: true })
  approvedById?: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'last_reviewed_at', type: 'timestamp', nullable: true })
  lastReviewedAt?: Date;

  @Column({ name: 'next_review_date', type: 'date', nullable: true })
  nextReviewDate?: Date;

  // Relations
  @ManyToOne(() => Supplier, (supplier) => supplier.masterContracts)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedBy?: User;

  @OneToMany(() => ContractProductSLA, (productSLA) => productSLA.masterContract, { cascade: true })
  productSLAs: ContractProductSLA[];

  @OneToMany(() => ContractPerformanceMetric, (metric) => metric.masterContract)
  performanceMetrics: ContractPerformanceMetric[];

  // Virtual properties
  get isCurrentlyActive(): boolean {
    const now = new Date();
    return this.status === ContractStatus.ACTIVE && 
           this.validFrom <= now && 
           this.validUntil >= now;
  }

  get isExpiringSoon(): boolean {
    if (!this.isCurrentlyActive) return false;
    
    const now = new Date();
    const daysUntilExpiry = Math.ceil((this.validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const noticeDays = this.metadata.renewalNoticeDays || 30;
    
    return daysUntilExpiry <= noticeDays;
  }

  get contractDurationDays(): number {
    return Math.ceil((this.validUntil.getTime() - this.validFrom.getTime()) / (1000 * 60 * 60 * 24));
  }

  get remainingDays(): number {
    if (!this.isActive) return 0;
    
    const now = new Date();
    return Math.max(0, Math.ceil((this.validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  get utilizationDays(): number {
    const now = new Date();
    const startDate = this.validFrom > now ? now : this.validFrom;
    return Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  get requiresReview(): boolean {
    if (!this.nextReviewDate) return false;
    return new Date() >= this.nextReviewDate;
  }

  // Helper methods for SLA calculations
  getProductSLA(productId: string): ContractProductSLA | undefined {
    return this.productSLAs?.find(sla => sla.productId === productId);
  }

  getDeliverySLAForProduct(productId: string): number {
    const productSLA = this.getProductSLA(productId);
    return productSLA?.deliverySLADays ?? this.defaultDeliverySLADays;
  }

  getQualityToleranceForProduct(productId: string): number {
    const productSLA = this.getProductSLA(productId);
    return productSLA?.qualityTolerancePercent ?? this.defaultQualityTolerancePercent;
  }

  getDeliveryToleranceForProduct(productId: string): number {
    const productSLA = this.getProductSLA(productId);
    return productSLA?.deliveryTolerancePercent ?? this.defaultDeliveryTolerancePercent;
  }
}