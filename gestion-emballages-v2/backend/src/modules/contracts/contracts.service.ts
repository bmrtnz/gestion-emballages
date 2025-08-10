import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { ContractStatus, ContractType, MasterContract } from './entities/master-contract.entity';
import { ContractProductSLA } from './entities/contract-product-sla.entity';
import { ContractPerformanceMetric } from './entities/contract-performance-metric.entity';
import {
  ContractFiltersDto,
  ContractSummaryDto,
  ContractValidationDto,
  CreateContractDto,
  UpdateContractDto,
} from './dto/contract.dto';
import { CreateProductSLADto, ProductSLAResponseDto, UpdateProductSLADto } from './dto/product-sla.dto';
import { PaginationService } from '@common/services/pagination.service';
import { Product } from '@modules/products/entities/product.entity';
import { Supplier } from '@modules/suppliers/entities/supplier.entity';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(MasterContract)
    private contractRepository: Repository<MasterContract>,

    @InjectRepository(ContractProductSLA)
    private productSLARepository: Repository<ContractProductSLA>,

    @InjectRepository(ContractPerformanceMetric)
    private performanceMetricRepository: Repository<ContractPerformanceMetric>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,

    private paginationService: PaginationService
  ) {}

  async create(createContractDto: CreateContractDto, createdById: string): Promise<MasterContract> {
    // Validate supplier exists
    const supplier = await this.supplierRepository.findOne({
      where: { id: createContractDto.supplierId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Check for duplicate contract numbers
    const existingContract = await this.contractRepository.findOne({
      where: { contractNumber: createContractDto.contractNumber },
    });

    if (existingContract) {
      throw new ConflictException('Contract number already exists');
    }

    // Validate date range
    const validFrom = new Date(createContractDto.validFrom);
    const validUntil = new Date(createContractDto.validUntil);

    if (validFrom >= validUntil) {
      throw new BadRequestException('Valid from date must be before valid until date');
    }

    const contract = this.contractRepository.create({
      ...createContractDto,
      validFrom,
      validUntil,
      createdById,
      status: ContractStatus.DRAFT,
    });

    return this.contractRepository.save(contract);
  }

  async findAll(filters: ContractFiltersDto) {
    const queryBuilder = this.contractRepository
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.supplier', 'supplier')
      .leftJoinAndSelect('contract.createdBy', 'createdBy')
      .leftJoinAndSelect('contract.approvedBy', 'approvedBy');

    // Apply filters
    if (filters.search) {
      queryBuilder.andWhere(
        '(contract.contractNumber ILIKE :search OR contract.contractName ILIKE :search OR contract.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.contractNumber) {
      queryBuilder.andWhere('contract.contractNumber ILIKE :contractNumber', {
        contractNumber: `%${filters.contractNumber}%`,
      });
    }

    if (filters.contractName) {
      queryBuilder.andWhere('contract.contractName ILIKE :contractName', {
        contractName: `%${filters.contractName}%`,
      });
    }

    if (filters.supplierId) {
      queryBuilder.andWhere('contract.supplierId = :supplierId', {
        supplierId: filters.supplierId,
      });
    }

    if (filters.contractType) {
      queryBuilder.andWhere('contract.contractType = :contractType', {
        contractType: filters.contractType,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere('contract.status = :status', {
        status: filters.status,
      });
    }

    if (filters.currency) {
      queryBuilder.andWhere('contract.currency = :currency', {
        currency: filters.currency,
      });
    }

    // Date filters
    if (filters.validFromStart) {
      queryBuilder.andWhere('contract.validFrom >= :validFromStart', {
        validFromStart: new Date(filters.validFromStart),
      });
    }

    if (filters.validFromEnd) {
      queryBuilder.andWhere('contract.validFrom <= :validFromEnd', {
        validFromEnd: new Date(filters.validFromEnd),
      });
    }

    if (filters.validUntilStart) {
      queryBuilder.andWhere('contract.validUntil >= :validUntilStart', {
        validUntilStart: new Date(filters.validUntilStart),
      });
    }

    if (filters.validUntilEnd) {
      queryBuilder.andWhere('contract.validUntil <= :validUntilEnd', {
        validUntilEnd: new Date(filters.validUntilEnd),
      });
    }

    // Special filters
    if (filters.activeOnly) {
      queryBuilder.andWhere('contract.status = :activeStatus', {
        activeStatus: ContractStatus.ACTIVE,
      });
    }

    if (filters.expiringOnly) {
      const days = filters.expiringDays || 30;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);

      queryBuilder.andWhere(
        'contract.status = :activeStatus AND contract.validUntil <= :expiryDate AND contract.validUntil > :now',
        {
          activeStatus: ContractStatus.ACTIVE,
          expiryDate,
          now: new Date(),
        }
      );
    }

    if (filters.requiresReview) {
      queryBuilder.andWhere('contract.nextReviewDate IS NOT NULL AND contract.nextReviewDate <= :now', {
        now: new Date(),
      });
    }

    // Apply sorting
    queryBuilder.orderBy(`contract.${filters.sortBy}`, filters.sortOrder);

    return this.paginationService.paginate(queryBuilder, filters.page, filters.limit);
  }

  async findOne(id: string): Promise<MasterContract> {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ['supplier', 'createdBy', 'approvedBy', 'productSLAs', 'productSLAs.product'],
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return contract;
  }

  async update(id: string, updateContractDto: UpdateContractDto, _updatedById: string): Promise<MasterContract> {
    const contract = await this.findOne(id);

    // Validate status transitions
    if (updateContractDto.status && updateContractDto.status !== contract.status) {
      this.validateStatusTransition(contract.status, updateContractDto.status);
    }

    // Handle date updates
    if (updateContractDto.validFrom || updateContractDto.validUntil) {
      const validFrom = updateContractDto.validFrom ? new Date(updateContractDto.validFrom) : contract.validFrom;
      const validUntil = updateContractDto.validUntil ? new Date(updateContractDto.validUntil) : contract.validUntil;

      if (validFrom >= validUntil) {
        throw new BadRequestException('Valid from date must be before valid until date');
      }

      updateContractDto.validFrom = validFrom.toISOString();
      updateContractDto.validUntil = validUntil.toISOString();
    }

    Object.assign(contract, updateContractDto);
    return this.contractRepository.save(contract);
  }

  async deactivate(id: string): Promise<void> {
    const contract = await this.findOne(id);

    contract.status = ContractStatus.TERMINATED;

    await this.contractRepository.save(contract);
  }

  async activate(id: string): Promise<MasterContract> {
    const contract = await this.findOne(id);

    if (contract.status !== ContractStatus.DRAFT && contract.status !== ContractStatus.SUSPENDED) {
      throw new BadRequestException('Contract can only be activated from DRAFT or SUSPENDED status');
    }

    contract.status = ContractStatus.ACTIVE;

    return this.contractRepository.save(contract);
  }

  async suspend(id: string, reason?: string): Promise<MasterContract> {
    const contract = await this.findOne(id);

    if (contract.status !== ContractStatus.ACTIVE) {
      throw new BadRequestException('Only active contracts can be suspended');
    }

    contract.status = ContractStatus.SUSPENDED;

    if (reason && contract.metadata) {
      contract.metadata.suspensionReason = reason;
      contract.metadata.suspendedAt = new Date().toISOString();
    }

    return this.contractRepository.save(contract);
  }

  async renew(
    id: string,
    renewalData: {
      validUntil: string;
      contractName?: string;
      adjustments?: Record<string, unknown>;
    },
    renewedById: string
  ): Promise<MasterContract> {
    const contract = await this.findOne(id);

    const newValidUntil = new Date(renewalData.validUntil);
    if (newValidUntil <= contract.validUntil) {
      throw new BadRequestException('New expiry date must be after current expiry date');
    }

    // Apply adjustments if provided
    if (renewalData.adjustments) {
      Object.assign(contract, renewalData.adjustments);
    }

    contract.validUntil = newValidUntil;
    if (renewalData.contractName) {
      contract.contractName = renewalData.contractName;
    }

    // Update metadata
    if (!contract.metadata) contract.metadata = {};
    contract.metadata.renewalHistory = contract.metadata.renewalHistory || [];
    contract.metadata.renewalHistory.push({
      renewedAt: new Date().toISOString(),
      renewedBy: renewedById,
      previousValidUntil: contract.validUntil.toISOString(),
      newValidUntil: newValidUntil.toISOString(),
      adjustments: renewalData.adjustments,
    });

    return this.contractRepository.save(contract);
  }

  async submitForReview(id: string, reviewNotes?: string): Promise<MasterContract> {
    const contract = await this.findOne(id);

    contract.nextReviewDate = new Date();
    if (reviewNotes) {
      contract.metadata = contract.metadata || {};
      contract.metadata.reviewNotes = reviewNotes;
    }

    return this.contractRepository.save(contract);
  }

  async approve(id: string, approvedById: string, approvalNotes?: string): Promise<MasterContract> {
    const contract = await this.findOne(id);

    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException('Only draft contracts can be approved');
    }

    contract.status = ContractStatus.ACTIVE;
    contract.approvedById = approvedById;
    contract.approvedAt = new Date();

    if (approvalNotes) {
      contract.metadata = contract.metadata || {};
      contract.metadata.approvalNotes = approvalNotes;
    }

    return this.contractRepository.save(contract);
  }

  async reject(id: string, rejectedById: string, rejectionReason: string): Promise<MasterContract> {
    const contract = await this.findOne(id);

    contract.status = ContractStatus.DRAFT; // Back to draft for corrections

    contract.metadata = contract.metadata || {};
    contract.metadata.rejectionHistory = contract.metadata.rejectionHistory || [];
    contract.metadata.rejectionHistory.push({
      rejectedAt: new Date().toISOString(),
      rejectedBy: rejectedById,
      reason: rejectionReason,
    });

    return this.contractRepository.save(contract);
  }

  // Product SLA Management

  async addProductSLA(
    contractId: string,
    createProductSLADto: CreateProductSLADto,
    createdById: string
  ): Promise<ContractProductSLA> {
    await this.findOne(contractId);

    // Validate product exists
    const product = await this.productRepository.findOne({
      where: { id: createProductSLADto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check for overlapping SLAs for the same product
    const effectiveFrom = new Date(createProductSLADto.effectiveFrom);
    const effectiveUntil = createProductSLADto.effectiveUntil ? new Date(createProductSLADto.effectiveUntil) : null;

    const overlappingSLA = await this.productSLARepository
      .createQueryBuilder('sla')
      .where('sla.masterContractId = :contractId', { contractId })
      .andWhere('sla.productId = :productId', { productId: createProductSLADto.productId })
      .andWhere('sla.effectiveFrom < :effectiveUntil', {
        effectiveUntil: effectiveUntil || new Date('2100-01-01'),
      })
      .andWhere(
        effectiveUntil
          ? 'sla.effectiveUntil IS NULL OR sla.effectiveUntil > :effectiveFrom'
          : 'sla.effectiveUntil IS NULL OR sla.effectiveUntil > :effectiveFrom',
        { effectiveFrom }
      )
      .getOne();

    if (overlappingSLA) {
      throw new ConflictException('Overlapping SLA exists for this product');
    }

    const productSLA = this.productSLARepository.create({
      ...createProductSLADto,
      masterContractId: contractId,
      effectiveFrom,
      effectiveUntil,
      createdById,
    });

    return this.productSLARepository.save(productSLA);
  }

  async getProductSLAs(contractId: string, productId?: string): Promise<ProductSLAResponseDto[]> {
    const queryBuilder = this.productSLARepository
      .createQueryBuilder('sla')
      .leftJoinAndSelect('sla.product', 'product')
      .leftJoinAndSelect('sla.masterContract', 'contract')
      .where('sla.masterContractId = :contractId', { contractId });

    if (productId) {
      queryBuilder.andWhere('sla.productId = :productId', { productId });
    }

    queryBuilder.orderBy('sla.createdAt', 'DESC');

    const productSLAs = await queryBuilder.getMany();

    return productSLAs.map(sla => ({
      id: sla.id,
      masterContractId: sla.masterContractId,
      product: {
        id: sla.product.id,
        name: sla.product.name,
        category: sla.product.category,
      },
      effectiveSLA: {
        deliverySLADays: sla.getEffectiveDeliverySLA(),
        qualityTolerancePercent: sla.getEffectiveQualityTolerance(),
        deliveryTolerancePercent: sla.deliveryTolerancePercent || sla.masterContract.defaultDeliveryTolerancePercent,
      },
      overrides: {
        deliverySLADays: sla.deliverySLADays,
        qualityTolerancePercent: sla.qualityTolerancePercent,
        deliveryTolerancePercent: sla.deliveryTolerancePercent,
        lateDeliveryPenaltyPercent: sla.lateDeliveryPenaltyPercent,
        qualityIssuePenaltyPercent: sla.qualityIssuePenaltyPercent,
        deliveryExcellenceBonusPercent: sla.deliveryExcellenceBonusPercent,
        qualityExcellenceBonusPercent: sla.qualityExcellenceBonusPercent,
      },
      status: {
        isCurrentlyEffective: sla.isCurrentlyEffective,
        isSuspended: sla.isSuspended,
        suspensionReason: sla.suspensionReason,
        effectiveFrom: sla.effectiveFrom,
        effectiveUntil: sla.effectiveUntil,
        daysUntilExpiry: sla.effectiveUntil
          ? Math.max(0, Math.ceil((sla.effectiveUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
          : undefined,
      },
      configuration: {
        hasSeasonalAdjustments: sla.hasSeasonalAdjustments,
        hasSpecialRequirements: sla.hasSpecialRequirements,
        hasEscalationRules: sla.hasEscalationRules,
        measurementPeriodDays: sla.measurementPeriodDays,
        gracePeriodDays: sla.gracePeriodDays,
      },
      audit: {
        createdAt: sla.createdAt,
        updatedAt: sla.updatedAt,
        createdBy: sla.createdById,
        lastReviewedAt: sla.lastReviewedAt,
        lastReviewedBy: sla.lastReviewedBy,
        reviewNotes: sla.reviewNotes,
      },
    }));
  }

  async updateProductSLA(
    contractId: string,
    slaId: string,
    updateProductSLADto: UpdateProductSLADto,
    updatedById: string
  ): Promise<ContractProductSLA> {
    const productSLA = await this.productSLARepository.findOne({
      where: { id: slaId, masterContractId: contractId },
    });

    if (!productSLA) {
      throw new NotFoundException('Product SLA not found');
    }

    Object.assign(productSLA, updateProductSLADto);
    productSLA.lastReviewedBy = updatedById;
    productSLA.lastReviewedAt = new Date();

    return this.productSLARepository.save(productSLA);
  }

  async removeProductSLA(contractId: string, slaId: string): Promise<void> {
    const productSLA = await this.productSLARepository.findOne({
      where: { id: slaId, masterContractId: contractId },
    });

    if (!productSLA) {
      throw new NotFoundException('Product SLA not found');
    }

    await this.productSLARepository.remove(productSLA);
  }

  async suspendProductSLA(contractId: string, slaId: string, reason: string): Promise<ContractProductSLA> {
    const productSLA = await this.productSLARepository.findOne({
      where: { id: slaId, masterContractId: contractId },
    });

    if (!productSLA) {
      throw new NotFoundException('Product SLA not found');
    }

    productSLA.isSuspended = true;
    productSLA.suspensionReason = reason;

    return this.productSLARepository.save(productSLA);
  }

  async resumeProductSLA(contractId: string, slaId: string): Promise<ContractProductSLA> {
    const productSLA = await this.productSLARepository.findOne({
      where: { id: slaId, masterContractId: contractId },
    });

    if (!productSLA) {
      throw new NotFoundException('Product SLA not found');
    }

    productSLA.isSuspended = false;
    productSLA.suspensionReason = null;

    return this.productSLARepository.save(productSLA);
  }

  // Utility methods

  async getContractSummary(id: string): Promise<ContractSummaryDto> {
    const contract = await this.findOne(id);

    // Get performance metrics summary (simplified for now)
    const recentMetrics = await this.performanceMetricRepository.find({
      where: {
        masterContractId: id,
        periodEnd: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // Last 30 days
      },
      order: { createdAt: 'DESC' },
    });

    const totalPenalties = recentMetrics.reduce((sum, m) => sum + m.penaltiesApplied, 0);
    const totalBonuses = recentMetrics.reduce((sum, m) => sum + m.bonusesEarned, 0);
    const avgScore =
      recentMetrics.length > 0
        ? recentMetrics.reduce((sum, m) => sum + m.performanceScore, 0) / recentMetrics.length
        : 0;

    // Get product SLA counts
    const productSLAs = await this.productSLARepository.find({
      where: { masterContractId: id },
    });

    return {
      contract: {
        id: contract.id,
        contractNumber: contract.contractNumber,
        contractName: contract.contractName,
        status: contract.status,
        contractType: contract.contractType,
        validFrom: contract.validFrom,
        validUntil: contract.validUntil,
        isExpiringSoon: contract.isExpiringSoon,
        remainingDays: contract.remainingDays,
      },
      supplier: {
        id: contract.supplier.id,
        name: contract.supplier.name,
        siret: contract.supplier.siret,
      },
      performance: {
        overallScore: avgScore,
        deliveryPerformance: 0, // Would be calculated from specific metrics
        qualityPerformance: 0, // Would be calculated from specific metrics
        lastCalculatedAt: recentMetrics[0]?.calculationTimestamp,
        totalPenalties,
        totalBonuses,
        netFinancialImpact: totalBonuses - totalPenalties,
      },
      productSLAs: {
        totalCount: productSLAs.length,
        activeCount: productSLAs.filter(sla => sla.isCurrentlyEffective).length,
        suspendedCount: productSLAs.filter(sla => sla.isSuspended).length,
        productsWithCustomSLAs: productSLAs.filter(
          sla => sla.deliverySLADays || sla.qualityTolerancePercent || sla.deliveryTolerancePercent
        ).length,
      },
      alerts: {
        pendingEscalations: recentMetrics.filter(m => m.escalationTriggered && m.requiresAction).length,
        criticalMetrics: recentMetrics.filter(m => m.status === 'CRITICAL').length,
        lastEscalationDate: recentMetrics.find(m => m.escalationDate)?.escalationDate,
        requiresAction: recentMetrics.some(m => m.requiresAction),
      },
      financials: {
        currency: contract.currency,
        volumeCommitment: contract.volumeCommitment,
        minimumOrderValue: contract.minimumOrderValue,
        defaultPenaltyRates: {
          lateDelivery: contract.lateDeliveryPenaltyPercent,
          qualityIssue: contract.qualityIssuePenaltyPercent,
        },
        defaultBonusRates: {
          deliveryExcellence: contract.deliveryExcellenceBonusPercent,
          qualityExcellence: contract.qualityExcellenceBonusPercent,
        },
      },
    };
  }

  async getContractProducts(id: string) {
    const productSLAs = await this.productSLARepository.find({
      where: { masterContractId: id },
      relations: ['product'],
    });

    return {
      totalProducts: productSLAs.length,
      products: productSLAs.map(sla => ({
        id: sla.product.id,
        name: sla.product.name,
        category: sla.product.category,
        hasCustomSLA: !!(sla.deliverySLADays || sla.qualityTolerancePercent),
        effectiveDeliverySLA: sla.getEffectiveDeliverySLA(),
        effectiveQualityTolerance: sla.getEffectiveQualityTolerance(),
        isCurrentlyEffective: sla.isCurrentlyEffective,
        isSuspended: sla.isSuspended,
      })),
    };
  }

  async validateSLAs(id: string): Promise<ContractValidationDto> {
    const contract = await this.findOne(id);
    const issues: Array<{
      type: 'ERROR' | 'WARNING' | 'INFO';
      code: string;
      message: string;
      field?: string;
      value?: unknown;
      suggestion?: string;
    }> = [];
    const slaConflicts: Array<{
      productId: string;
      productName: string;
      conflictType: 'OVERLAPPING_PERIODS' | 'CONTRADICTORY_TERMS' | 'MISSING_REQUIREMENTS';
      description: string;
      affectedSLAs: string[];
      resolution: string;
    }> = [];
    const recommendations: string[] = [];

    // Validate contract dates
    if (contract.validFrom >= contract.validUntil) {
      issues.push({
        type: 'ERROR',
        code: 'INVALID_DATE_RANGE',
        message: 'Contract valid from date must be before valid until date',
        field: 'validFrom',
        suggestion: 'Adjust the contract validity dates',
      });
    }

    // Get all product SLAs for analysis
    const productSLAs = await this.productSLARepository.find({
      where: { masterContractId: id },
      relations: ['product'],
    });

    // Check for overlapping SLAs
    const productGroups = productSLAs.reduce(
      (groups, sla) => {
        if (!groups[sla.productId]) {
          groups[sla.productId] = [];
        }
        groups[sla.productId].push(sla);
        return groups;
      },
      {} as Record<string, ContractProductSLA[]>
    );

    Object.entries(productGroups).forEach(([productId, slas]) => {
      if (slas.length > 1) {
        // Check for overlapping periods
        for (let i = 0; i < slas.length; i++) {
          for (let j = i + 1; j < slas.length; j++) {
            const sla1 = slas[i];
            const sla2 = slas[j];

            const overlap = this.checkSLAOverlap(sla1, sla2);
            if (overlap) {
              slaConflicts.push({
                productId,
                productName: sla1.product.name,
                conflictType: 'OVERLAPPING_PERIODS',
                description: `Overlapping SLA periods detected`,
                affectedSLAs: [sla1.id, sla2.id],
                resolution: 'Adjust effective dates to eliminate overlap',
              });
            }
          }
        }
      }
    });

    // Analyze thresholds
    const deliverySLAs = productSLAs.map(sla => sla.getEffectiveDeliverySLA()).filter(v => v > 0);
    const qualityTolerances = productSLAs.map(sla => sla.getEffectiveQualityTolerance()).filter(v => v > 0);

    const thresholdAnalysis = {
      deliverySLA: {
        min: Math.min(...deliverySLAs, contract.defaultDeliverySLADays),
        max: Math.max(...deliverySLAs, contract.defaultDeliverySLADays),
        average:
          deliverySLAs.length > 0
            ? deliverySLAs.reduce((a, b) => a + b, 0) / deliverySLAs.length
            : contract.defaultDeliverySLADays,
        outliers: [], // Would identify products with significantly different SLAs
      },
      qualityTolerance: {
        min: Math.min(...qualityTolerances, contract.defaultQualityTolerancePercent),
        max: Math.max(...qualityTolerances, contract.defaultQualityTolerancePercent),
        average:
          qualityTolerances.length > 0
            ? qualityTolerances.reduce((a, b) => a + b, 0) / qualityTolerances.length
            : contract.defaultQualityTolerancePercent,
        outliers: [],
      },
      penalties: {
        totalPenaltyRate: contract.lateDeliveryPenaltyPercent + contract.qualityIssuePenaltyPercent,
        highRiskProducts: productSLAs
          .filter(
            sla =>
              (sla.lateDeliveryPenaltyPercent || contract.lateDeliveryPenaltyPercent) > 2.0 ||
              (sla.qualityIssuePenaltyPercent || contract.qualityIssuePenaltyPercent) > 3.0
          )
          .map(sla => sla.productId),
      },
    };

    // Generate recommendations
    if (thresholdAnalysis.deliverySLA.max - thresholdAnalysis.deliverySLA.min > 10) {
      recommendations.push('Consider standardizing delivery SLAs - high variation detected');
    }

    if (thresholdAnalysis.penalties.totalPenaltyRate > 5.0) {
      recommendations.push('Total penalty rates are high - review supplier relationship');
    }

    if (slaConflicts.length > 0) {
      recommendations.push('Resolve SLA conflicts before contract activation');
    }

    const isValid = issues.filter(i => i.type === 'ERROR').length === 0 && slaConflicts.length === 0;

    return {
      isValid,
      issues,
      slaConflicts,
      thresholdAnalysis,
      recommendations,
    };
  }

  async findExpiringContracts(days: number = 30, page: number = 1, limit: number = 10) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const queryBuilder = this.contractRepository
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.supplier', 'supplier')
      .where('contract.status = :status', { status: ContractStatus.ACTIVE })
      .andWhere('contract.validUntil <= :expiryDate', { expiryDate })
      .andWhere('contract.validUntil > :now', { now: new Date() })
      .orderBy('contract.validUntil', 'ASC');

    return this.paginationService.paginate(queryBuilder, page, limit);
  }

  async findBySupplier(supplierId: string, includeInactive: boolean = false) {
    const queryBuilder = this.contractRepository
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.supplier', 'supplier')
      .where('contract.supplierId = :supplierId', { supplierId });

    if (!includeInactive) {
      queryBuilder.andWhere('contract.status != :terminatedStatus', {
        terminatedStatus: ContractStatus.TERMINATED,
      });
    }

    queryBuilder.orderBy('contract.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async getContractTemplates() {
    // This would return predefined contract templates
    return {
      templates: [
        {
          name: 'Standard Annual Contract',
          description: 'Standard annual framework agreement template',
          contractType: ContractType.ANNUAL,
          defaultValues: {
            defaultDeliverySLADays: 7,
            defaultQualityTolerancePercent: 2.0,
            defaultDeliveryTolerancePercent: 5.0,
            lateDeliveryPenaltyPercent: 0.5,
            qualityIssuePenaltyPercent: 1.0,
            currency: 'EUR',
          },
        },
        {
          name: 'Seasonal Contract',
          description: 'Seasonal packaging supply contract',
          contractType: ContractType.SEASONAL,
          defaultValues: {
            defaultDeliverySLADays: 5,
            defaultQualityTolerancePercent: 1.5,
            defaultDeliveryTolerancePercent: 3.0,
            lateDeliveryPenaltyPercent: 0.8,
            qualityIssuePenaltyPercent: 1.5,
            currency: 'EUR',
          },
        },
      ],
    };
  }

  async duplicate(
    id: string,
    options: {
      contractName: string;
      supplierId?: string;
      validFrom: string;
      validUntil: string;
      includeSLAs?: boolean;
      adjustments?: Record<string, unknown>;
    },
    duplicatedById: string
  ): Promise<MasterContract> {
    const originalContract = await this.findOne(id);

    const newContractData: Partial<CreateContractDto> = {
      contractNumber: `${originalContract.contractNumber}-COPY-${Date.now()}`,
      contractName: options.contractName,
      supplierId: options.supplierId || originalContract.supplierId,
      contractType: originalContract.contractType,
      validFrom: options.validFrom,
      validUntil: options.validUntil,
      description: originalContract.description,
      paymentTerms: originalContract.paymentTerms,
      deliveryTerms: originalContract.deliveryTerms,
      defaultDeliverySLADays: originalContract.defaultDeliverySLADays,
      defaultQualityTolerancePercent: originalContract.defaultQualityTolerancePercent,
      defaultDeliveryTolerancePercent: originalContract.defaultDeliveryTolerancePercent,
      volumeCommitment: originalContract.volumeCommitment,
      minimumOrderValue: originalContract.minimumOrderValue,
      currency: originalContract.currency,
      lateDeliveryPenaltyPercent: originalContract.lateDeliveryPenaltyPercent,
      qualityIssuePenaltyPercent: originalContract.qualityIssuePenaltyPercent,
      deliveryExcellenceBonusPercent: originalContract.deliveryExcellenceBonusPercent,
      qualityExcellenceBonusPercent: originalContract.qualityExcellenceBonusPercent,
      metadata: { ...originalContract.metadata },
    };

    // Apply adjustments
    if (options.adjustments) {
      Object.assign(newContractData, options.adjustments);
    }

    const newContract = await this.create(newContractData as CreateContractDto, duplicatedById);

    // Copy product SLAs if requested
    if (options.includeSLAs) {
      const originalSLAs = await this.productSLARepository.find({
        where: { masterContractId: id },
      });

      for (const originalSLA of originalSLAs) {
        const newSLAData: CreateProductSLADto = {
          productId: originalSLA.productId,
          deliverySLADays: originalSLA.deliverySLADays,
          deliveryTolerancePercent: originalSLA.deliveryTolerancePercent,
          maxDeliveryDelayDays: originalSLA.maxDeliveryDelayDays,
          qualityTolerancePercent: originalSLA.qualityTolerancePercent,
          maxQualityDefectRate: originalSLA.maxQualityDefectRate,
          criticalQualityThreshold: originalSLA.criticalQualityThreshold,
          quantityAccuracyThreshold: originalSLA.quantityAccuracyThreshold,
          packagingComplianceRate: originalSLA.packagingComplianceRate,
          lateDeliveryPenaltyPercent: originalSLA.lateDeliveryPenaltyPercent,
          qualityIssuePenaltyPercent: originalSLA.qualityIssuePenaltyPercent,
          quantityShortagePenaltyPercent: originalSLA.quantityShortagePenaltyPercent,
          deliveryExcellenceBonusPercent: originalSLA.deliveryExcellenceBonusPercent,
          qualityExcellenceBonusPercent: originalSLA.qualityExcellenceBonusPercent,
          minimumOrderFulfillmentRate: originalSLA.minimumOrderFulfillmentRate,
          maximumResponseTimeHours: originalSLA.maximumResponseTimeHours,
          requiredLeadTimeDays: originalSLA.requiredLeadTimeDays,
          seasonalAdjustments: originalSLA.seasonalAdjustments,
          specialRequirements: originalSLA.specialRequirements,
          escalationRules: originalSLA.escalationRules,
          measurementPeriodDays: originalSLA.measurementPeriodDays,
          gracePeriodDays: originalSLA.gracePeriodDays,
          effectiveFrom: options.validFrom,
        };

        await this.addProductSLA(newContract.id, newSLAData, duplicatedById);
      }
    }

    return newContract;
  }

  // Private helper methods

  private validateStatusTransition(currentStatus: ContractStatus, newStatus: ContractStatus): void {
    const validTransitions: Record<ContractStatus, ContractStatus[]> = {
      [ContractStatus.DRAFT]: [ContractStatus.ACTIVE, ContractStatus.TERMINATED],
      [ContractStatus.ACTIVE]: [ContractStatus.SUSPENDED, ContractStatus.EXPIRED, ContractStatus.TERMINATED],
      [ContractStatus.SUSPENDED]: [ContractStatus.ACTIVE, ContractStatus.TERMINATED],
      [ContractStatus.EXPIRED]: [ContractStatus.TERMINATED],
      [ContractStatus.TERMINATED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }

  private checkSLAOverlap(sla1: ContractProductSLA, sla2: ContractProductSLA): boolean {
    const start1 = sla1.effectiveFrom;
    const end1 = sla1.effectiveUntil || new Date('2100-01-01');
    const start2 = sla2.effectiveFrom;
    const end2 = sla2.effectiveUntil || new Date('2100-01-01');

    return start1 < end2 && start2 < end1;
  }
}
