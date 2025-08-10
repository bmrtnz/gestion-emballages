import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, MoreThan, Repository } from 'typeorm';
import { ContractStatus, MasterContract } from '../entities/master-contract.entity';
import { ContractProductSLA } from '../entities/contract-product-sla.entity';
import {
  ContractPerformanceMetric,
  MeasurementPeriod,
  MetricType,
  PerformanceStatus,
} from '../entities/contract-performance-metric.entity';
import { PurchaseOrder } from '@modules/orders/entities/purchase-order.entity';
import { PurchaseOrderProduct } from '@modules/orders/entities/purchase-order-product.entity';
import { OrderStatus } from '@common/enums/order-status.enum';

export interface PerformanceCalculationResult {
  contractId: string;
  productId?: string;
  metricType: MetricType;
  targetValue: number;
  actualValue: number;
  variance: number;
  variancePercent: number;
  status: PerformanceStatus;
  sampleSize: number;
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  financialImpact?: {
    penalties: number;
    bonuses: number;
    netImpact: number;
  };
}

export interface ContractPerformanceReport {
  contract: MasterContract;
  overallScore: number;
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL';
  totalPenalties: number;
  totalBonuses: number;
  netFinancialImpact: number;
  metrics: ContractPerformanceMetric[];
  recommendations: string[];
  escalations: Array<{
    level: number;
    reason: string;
    actionRequired: string;
    deadline?: Date;
  }>;
}

export interface DashboardMetrics {
  totalActiveContracts: number;
  contractsAtRisk: number;
  contractsExcellent: number;
  totalPenaltiesThisMonth: number;
  totalBonusesThisMonth: number;
  avgDeliveryPerformance: number;
  avgQualityPerformance: number;
  pendingEscalations: number;
  contractsExpiringWithin30Days: number;
}

@Injectable()
export class ContractAdherenceService {
  private readonly logger = new Logger(ContractAdherenceService.name);

  constructor(
    @InjectRepository(MasterContract)
    private contractRepository: Repository<MasterContract>,

    @InjectRepository(ContractProductSLA)
    private productSLARepository: Repository<ContractProductSLA>,

    @InjectRepository(ContractPerformanceMetric)
    private performanceMetricRepository: Repository<ContractPerformanceMetric>,

    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,

    @InjectRepository(PurchaseOrderProduct)
    private purchaseOrderProductRepository: Repository<PurchaseOrderProduct>
  ) {}

  /**
   * Calculate performance metrics for all active contracts
   */
  async calculateAllContractPerformance(
    startDate: Date,
    endDate: Date,
    measurementPeriod: MeasurementPeriod = MeasurementPeriod.MONTHLY
  ): Promise<PerformanceCalculationResult[]> {
    this.logger.log(
      `Calculating contract performance for period: ${startDate.toISOString()} to ${endDate.toISOString()}`
    );

    const activeContracts = await this.contractRepository.find({
      where: {
        status: ContractStatus.ACTIVE,
        validFrom: LessThan(endDate),
        validUntil: MoreThan(startDate),
      },
      relations: ['productSLAs', 'supplier'],
    });

    const results: PerformanceCalculationResult[] = [];

    for (const contract of activeContracts) {
      this.logger.debug(`Processing contract: ${contract.contractNumber}`);

      // Calculate contract-level metrics
      const contractMetrics = await this.calculateContractLevelMetrics(contract, startDate, endDate, measurementPeriod);
      results.push(...contractMetrics);

      // Calculate product-specific metrics
      for (const productSLA of contract.productSLAs) {
        const productMetrics = await this.calculateProductSLAMetrics(
          contract,
          productSLA,
          startDate,
          endDate,
          measurementPeriod
        );
        results.push(...productMetrics);
      }
    }

    // Store calculated metrics in database
    await this.storePerformanceMetrics(results, startDate, endDate, measurementPeriod);

    this.logger.log(`Completed performance calculation for ${results.length} metrics`);
    return results;
  }

  /**
   * Calculate contract-level performance metrics
   */
  private async calculateContractLevelMetrics(
    contract: MasterContract,
    startDate: Date,
    endDate: Date,
    measurementPeriod: MeasurementPeriod
  ): Promise<PerformanceCalculationResult[]> {
    const results: PerformanceCalculationResult[] = [];

    // Get all orders for this contract in the period
    const orders = await this.purchaseOrderRepository.find({
      where: {
        supplierId: contract.supplierId,
        createdAt: Between(startDate, endDate),
      },
      relations: ['orderProducts', 'orderProducts.product'],
    });

    // Calculate delivery performance
    const deliveryMetric = await this.calculateDeliveryPerformance(contract, orders, startDate, endDate);
    if (deliveryMetric) results.push(deliveryMetric);

    // Calculate overall quality performance
    const qualityMetric = await this.calculateQualityPerformance(contract, orders, startDate, endDate);
    if (qualityMetric) results.push(qualityMetric);

    // Calculate order fulfillment rate
    const fulfillmentMetric = await this.calculateOrderFulfillmentRate(contract, orders, startDate, endDate);
    if (fulfillmentMetric) results.push(fulfillmentMetric);

    return results;
  }

  /**
   * Calculate product-specific SLA metrics
   */
  private async calculateProductSLAMetrics(
    contract: MasterContract,
    productSLA: ContractProductSLA,
    startDate: Date,
    endDate: Date,
    measurementPeriod: MeasurementPeriod
  ): Promise<PerformanceCalculationResult[]> {
    const results: PerformanceCalculationResult[] = [];

    // Get orders for this specific product
    const purchaseOrderProducts = await this.purchaseOrderProductRepository.find({
      where: {
        productId: productSLA.productId,
        purchaseOrder: {
          supplierId: contract.supplierId,
          createdAt: Between(startDate, endDate),
        },
      },
      relations: ['purchaseOrder', 'product'],
    });

    if (purchaseOrderProducts.length === 0) {
      return results;
    }

    // Calculate product-specific delivery performance
    const deliveryMetric = await this.calculateProductDeliveryPerformance(
      contract,
      productSLA,
      purchaseOrderProducts,
      startDate,
      endDate
    );
    if (deliveryMetric) results.push(deliveryMetric);

    // Calculate product-specific quality performance
    const qualityMetric = await this.calculateProductQualityPerformance(
      contract,
      productSLA,
      purchaseOrderProducts,
      startDate,
      endDate
    );
    if (qualityMetric) results.push(qualityMetric);

    // Calculate quantity accuracy
    const quantityMetric = await this.calculateProductQuantityAccuracy(
      contract,
      productSLA,
      purchaseOrderProducts,
      startDate,
      endDate
    );
    if (quantityMetric) results.push(quantityMetric);

    return results;
  }

  /**
   * Calculate delivery performance for contract
   */
  private async calculateDeliveryPerformance(
    contract: MasterContract,
    orders: PurchaseOrder[],
    startDate: Date,
    endDate: Date
  ): Promise<PerformanceCalculationResult | null> {
    const deliveredOrders = orders.filter(
      order => order.status === OrderStatus.RECEPTIONNEE && order.actualDeliveryDate
    );

    if (deliveredOrders.length === 0) return null;

    let onTimeDeliveries = 0;
    let totalDeliveryDays = 0;
    const targetSLA = contract.defaultDeliverySLADays;

    for (const order of deliveredOrders) {
      const deliveryTime = Math.ceil(
        (order.actualDeliveryDate.getTime() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      totalDeliveryDays += deliveryTime;

      if (deliveryTime <= targetSLA) {
        onTimeDeliveries++;
      }
    }

    const actualValue = (onTimeDeliveries / deliveredOrders.length) * 100;
    const targetValue = 100 - contract.defaultDeliveryTolerancePercent; // e.g., 95% on-time
    const variance = actualValue - targetValue;
    const variancePercent = targetValue > 0 ? (variance / targetValue) * 100 : 0;

    let status: PerformanceStatus;
    if (actualValue >= targetValue + 5) status = PerformanceStatus.EXCELLENT;
    else if (actualValue >= targetValue) status = PerformanceStatus.GOOD;
    else if (actualValue >= targetValue - 5) status = PerformanceStatus.WARNING;
    else if (actualValue >= targetValue - 15) status = PerformanceStatus.BREACH;
    else status = PerformanceStatus.CRITICAL;

    // Calculate financial impact
    const averageOrderValue = orders.reduce((sum, order) => sum + order.totalAmountExcludingTax, 0) / orders.length;
    const lateOrders = deliveredOrders.length - onTimeDeliveries;
    const penalties = lateOrders * averageOrderValue * (contract.lateDeliveryPenaltyPercent / 100);

    const earlyDeliveries = deliveredOrders.filter(order => {
      const deliveryTime = Math.ceil(
        (order.actualDeliveryDate.getTime() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      return deliveryTime < targetSLA - 1; // 1 day early threshold
    }).length;

    const bonuses = earlyDeliveries * averageOrderValue * (contract.deliveryExcellenceBonusPercent / 100);

    return {
      contractId: contract.id,
      metricType: MetricType.DELIVERY_PERFORMANCE,
      targetValue,
      actualValue,
      variance,
      variancePercent,
      status,
      sampleSize: deliveredOrders.length,
      totalEvents: orders.length,
      successfulEvents: onTimeDeliveries,
      failedEvents: lateOrders,
      financialImpact: {
        penalties,
        bonuses,
        netImpact: bonuses - penalties,
      },
    };
  }

  /**
   * Calculate quality performance for contract
   */
  private async calculateQualityPerformance(
    contract: MasterContract,
    orders: PurchaseOrder[],
    startDate: Date,
    endDate: Date
  ): Promise<PerformanceCalculationResult | null> {
    // This would integrate with the document management system to count quality issues
    // For now, we'll simulate based on order status

    const deliveredOrders = orders.filter(order => order.status === OrderStatus.RECEPTIONNEE);
    if (deliveredOrders.length === 0) return null;

    // Count orders with quality issues (this would be determined by discrepancy photos/reports)
    const ordersWithIssues = deliveredOrders.filter(
      order =>
        // This is a placeholder - in reality, you'd check for quality discrepancy documents
        Math.random() < 0.05 // Simulate 5% quality issue rate for demo
    ).length;

    const ordersWithoutIssues = deliveredOrders.length - ordersWithIssues;
    const actualValue = (ordersWithoutIssues / deliveredOrders.length) * 100;
    const targetValue = 100 - contract.defaultQualityTolerancePercent;
    const variance = actualValue - targetValue;
    const variancePercent = targetValue > 0 ? (variance / targetValue) * 100 : 0;

    let status: PerformanceStatus;
    if (actualValue >= targetValue + 2) status = PerformanceStatus.EXCELLENT;
    else if (actualValue >= targetValue) status = PerformanceStatus.GOOD;
    else if (actualValue >= targetValue - 2) status = PerformanceStatus.WARNING;
    else if (actualValue >= targetValue - 5) status = PerformanceStatus.BREACH;
    else status = PerformanceStatus.CRITICAL;

    const averageOrderValue = orders.reduce((sum, order) => sum + order.totalAmountExcludingTax, 0) / orders.length;
    const penalties = ordersWithIssues * averageOrderValue * (contract.qualityIssuePenaltyPercent / 100);
    const bonuses =
      ordersWithoutIssues === deliveredOrders.length
        ? deliveredOrders.length * averageOrderValue * (contract.qualityExcellenceBonusPercent / 100)
        : 0;

    return {
      contractId: contract.id,
      metricType: MetricType.QUALITY_PERFORMANCE,
      targetValue,
      actualValue,
      variance,
      variancePercent,
      status,
      sampleSize: deliveredOrders.length,
      totalEvents: deliveredOrders.length,
      successfulEvents: ordersWithoutIssues,
      failedEvents: ordersWithIssues,
      financialImpact: {
        penalties,
        bonuses,
        netImpact: bonuses - penalties,
      },
    };
  }

  /**
   * Calculate order fulfillment rate
   */
  private async calculateOrderFulfillmentRate(
    contract: MasterContract,
    orders: PurchaseOrder[],
    startDate: Date,
    endDate: Date
  ): Promise<PerformanceCalculationResult | null> {
    if (orders.length === 0) return null;

    const fulfilledOrders = orders.filter(order =>
      [OrderStatus.RECEPTIONNEE, OrderStatus.CLOTUREE].includes(order.status)
    ).length;

    const actualValue = (fulfilledOrders / orders.length) * 100;
    const targetValue = 95; // Default 95% fulfillment rate expectation
    const variance = actualValue - targetValue;
    const variancePercent = targetValue > 0 ? (variance / targetValue) * 100 : 0;

    let status: PerformanceStatus;
    if (actualValue >= 98) status = PerformanceStatus.EXCELLENT;
    else if (actualValue >= targetValue) status = PerformanceStatus.GOOD;
    else if (actualValue >= targetValue - 5) status = PerformanceStatus.WARNING;
    else if (actualValue >= targetValue - 10) status = PerformanceStatus.BREACH;
    else status = PerformanceStatus.CRITICAL;

    return {
      contractId: contract.id,
      metricType: MetricType.ORDER_FULFILLMENT_RATE,
      targetValue,
      actualValue,
      variance,
      variancePercent,
      status,
      sampleSize: orders.length,
      totalEvents: orders.length,
      successfulEvents: fulfilledOrders,
      failedEvents: orders.length - fulfilledOrders,
    };
  }

  /**
   * Calculate product-specific delivery performance
   */
  private async calculateProductDeliveryPerformance(
    contract: MasterContract,
    productSLA: ContractProductSLA,
    purchaseOrderProducts: PurchaseOrderProduct[],
    startDate: Date,
    endDate: Date
  ): Promise<PerformanceCalculationResult | null> {
    const deliveredProducts = purchaseOrderProducts.filter(
      pop => pop.purchaseOrder.status === OrderStatus.RECEPTIONNEE && pop.purchaseOrder.actualDeliveryDate
    );

    if (deliveredProducts.length === 0) return null;

    const targetSLA = productSLA.getEffectiveDeliverySLA();
    let onTimeDeliveries = 0;

    for (const purchaseOrderProduct of deliveredProducts) {
      const deliveryTime = Math.ceil(
        (purchaseOrderProduct.purchaseOrder.actualDeliveryDate.getTime() -
          purchaseOrderProduct.purchaseOrder.createdAt.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (deliveryTime <= targetSLA) {
        onTimeDeliveries++;
      }
    }

    const actualValue = (onTimeDeliveries / deliveredProducts.length) * 100;
    const targetValue = 100 - (productSLA.deliveryTolerancePercent || contract.defaultDeliveryTolerancePercent);
    const variance = actualValue - targetValue;
    const variancePercent = targetValue > 0 ? (variance / targetValue) * 100 : 0;

    let status: PerformanceStatus;
    if (actualValue >= targetValue + 5) status = PerformanceStatus.EXCELLENT;
    else if (actualValue >= targetValue) status = PerformanceStatus.GOOD;
    else if (actualValue >= targetValue - 5) status = PerformanceStatus.WARNING;
    else if (actualValue >= targetValue - 15) status = PerformanceStatus.BREACH;
    else status = PerformanceStatus.CRITICAL;

    return {
      contractId: contract.id,
      productId: productSLA.productId,
      metricType: MetricType.DELIVERY_PERFORMANCE,
      targetValue,
      actualValue,
      variance,
      variancePercent,
      status,
      sampleSize: deliveredProducts.length,
      totalEvents: purchaseOrderProducts.length,
      successfulEvents: onTimeDeliveries,
      failedEvents: deliveredProducts.length - onTimeDeliveries,
    };
  }

  /**
   * Calculate product-specific quality performance
   */
  private async calculateProductQualityPerformance(
    contract: MasterContract,
    productSLA: ContractProductSLA,
    purchaseOrderProducts: PurchaseOrderProduct[],
    startDate: Date,
    endDate: Date
  ): Promise<PerformanceCalculationResult | null> {
    // Similar implementation to contract-level quality, but product-specific
    const deliveredProducts = purchaseOrderProducts.filter(
      pop => pop.purchaseOrder.status === OrderStatus.RECEPTIONNEE
    );

    if (deliveredProducts.length === 0) return null;

    // Placeholder for quality issues detection
    const productsWithIssues = deliveredProducts.filter(
      pop => Math.random() < 0.03 // Simulate 3% quality issue rate for specific products
    ).length;

    const productsWithoutIssues = deliveredProducts.length - productsWithIssues;
    const actualValue = (productsWithoutIssues / deliveredProducts.length) * 100;
    const targetValue = 100 - productSLA.getEffectiveQualityTolerance();
    const variance = actualValue - targetValue;
    const variancePercent = targetValue > 0 ? (variance / targetValue) * 100 : 0;

    let status: PerformanceStatus;
    if (actualValue >= targetValue + 2) status = PerformanceStatus.EXCELLENT;
    else if (actualValue >= targetValue) status = PerformanceStatus.GOOD;
    else if (actualValue >= targetValue - 2) status = PerformanceStatus.WARNING;
    else if (actualValue >= targetValue - 5) status = PerformanceStatus.BREACH;
    else status = PerformanceStatus.CRITICAL;

    return {
      contractId: contract.id,
      productId: productSLA.productId,
      metricType: MetricType.QUALITY_PERFORMANCE,
      targetValue,
      actualValue,
      variance,
      variancePercent,
      status,
      sampleSize: deliveredProducts.length,
      totalEvents: deliveredProducts.length,
      successfulEvents: productsWithoutIssues,
      failedEvents: productsWithIssues,
    };
  }

  /**
   * Calculate product quantity accuracy
   */
  private async calculateProductQuantityAccuracy(
    contract: MasterContract,
    productSLA: ContractProductSLA,
    purchaseOrderProducts: PurchaseOrderProduct[],
    startDate: Date,
    endDate: Date
  ): Promise<PerformanceCalculationResult | null> {
    const deliveredProducts = purchaseOrderProducts.filter(
      pop => pop.purchaseOrder.status === OrderStatus.RECEPTIONNEE && pop.orderedQuantity !== undefined
    );

    if (deliveredProducts.length === 0) return null;

    let accurateDeliveries = 0;
    const threshold = productSLA.quantityAccuracyThreshold || 98; // 98% accuracy threshold

    for (const purchaseOrderProduct of deliveredProducts) {
      // TODO: Add deliveredQuantity field to PurchaseOrderProduct entity
      const accuracy = 100; // Placeholder - assuming accurate delivery until deliveredQuantity is available
      if (accuracy >= threshold && accuracy <= 102) {
        // Allow 2% overdelivery
        accurateDeliveries++;
      }
    }

    const actualValue = (accurateDeliveries / deliveredProducts.length) * 100;
    const targetValue = threshold;
    const variance = actualValue - targetValue;
    const variancePercent = targetValue > 0 ? (variance / targetValue) * 100 : 0;

    let status: PerformanceStatus;
    if (actualValue >= targetValue + 2) status = PerformanceStatus.EXCELLENT;
    else if (actualValue >= targetValue) status = PerformanceStatus.GOOD;
    else if (actualValue >= targetValue - 5) status = PerformanceStatus.WARNING;
    else if (actualValue >= targetValue - 10) status = PerformanceStatus.BREACH;
    else status = PerformanceStatus.CRITICAL;

    return {
      contractId: contract.id,
      productId: productSLA.productId,
      metricType: MetricType.QUANTITY_ACCURACY,
      targetValue,
      actualValue,
      variance,
      variancePercent,
      status,
      sampleSize: deliveredProducts.length,
      totalEvents: deliveredProducts.length,
      successfulEvents: accurateDeliveries,
      failedEvents: deliveredProducts.length - accurateDeliveries,
    };
  }

  /**
   * Store calculated performance metrics in database
   */
  private async storePerformanceMetrics(
    results: PerformanceCalculationResult[],
    periodStart: Date,
    periodEnd: Date,
    measurementPeriod: MeasurementPeriod
  ): Promise<void> {
    const entities: ContractPerformanceMetric[] = [];

    for (const result of results) {
      const entity = this.performanceMetricRepository.create({
        masterContractId: result.contractId,
        productId: result.productId,
        metricType: result.metricType,
        measurementPeriod,
        periodStart,
        periodEnd,
        targetValue: result.targetValue,
        actualValue: result.actualValue,
        variance: result.variance,
        variancePercent: result.variancePercent,
        status: result.status,
        sampleSize: result.sampleSize,
        totalEvents: result.totalEvents,
        successfulEvents: result.successfulEvents,
        failedEvents: result.failedEvents,
        penaltiesApplied: result.financialImpact?.penalties || 0,
        bonusesEarned: result.financialImpact?.bonuses || 0,
        netFinancialImpact: result.financialImpact?.netImpact || 0,
        calculationMethod: 'automated_calculation',
        dataSources: ['purchase_orders', 'order_products'],
        calculationTimestamp: new Date(),
        calculatedById: 'system', // In real implementation, use service account ID
      });

      entities.push(entity);
    }

    await this.performanceMetricRepository.save(entities);
    this.logger.log(`Stored ${entities.length} performance metrics in database`);
  }

  /**
   * Generate contract performance report for manager dashboard
   */
  async generateContractPerformanceReport(
    contractId: string,
    periodStart?: Date,
    periodEnd?: Date
  ): Promise<ContractPerformanceReport> {
    const contract = await this.contractRepository.findOne({
      where: { id: contractId },
      relations: ['supplier', 'productSLAs'],
    });

    if (!contract) {
      throw new Error(`Contract not found: ${contractId}`);
    }

    const endDate = periodEnd || new Date();
    const startDate = periodStart || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    const metrics = await this.performanceMetricRepository.find({
      where: {
        masterContractId: contractId,
        periodStart: MoreThan(startDate),
        periodEnd: LessThan(endDate),
      },
      order: { createdAt: 'DESC' },
    });

    // Calculate overall performance score
    const overallScore =
      metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.performanceScore, 0) / metrics.length : 0;

    // Determine overall status
    let status: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL';
    if (overallScore >= 95) status = 'EXCELLENT';
    else if (overallScore >= 85) status = 'GOOD';
    else if (overallScore >= 70) status = 'NEEDS_ATTENTION';
    else status = 'CRITICAL';

    // Calculate financial impact
    const totalPenalties = metrics.reduce((sum, m) => sum + m.penaltiesApplied, 0);
    const totalBonuses = metrics.reduce((sum, m) => sum + m.bonusesEarned, 0);
    const netFinancialImpact = totalBonuses - totalPenalties;

    // Generate recommendations
    const recommendations = this.generateRecommendations(contract, metrics);

    // Identify escalations
    const escalations = metrics
      .filter(m => m.escalationTriggered && m.requiresAction)
      .map(m => ({
        level: m.escalationLevel,
        reason: m.escalationNotes || `${m.metricType} SLA breach`,
        actionRequired: m.actionPlan || 'Review performance and implement corrective actions',
        deadline: m.actionDeadline,
      }));

    return {
      contract,
      overallScore,
      status,
      totalPenalties,
      totalBonuses,
      netFinancialImpact,
      metrics,
      recommendations,
      escalations,
    };
  }

  /**
   * Get dashboard metrics for manager overview
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalActiveContracts,
      contractsAtRisk,
      contractsExcellent,
      monthlyMetrics,
      pendingEscalations,
      contractsExpiringWithin30Days,
    ] = await Promise.all([
      this.contractRepository.count({
        where: { status: ContractStatus.ACTIVE },
      }),

      this.performanceMetricRepository
        .createQueryBuilder('pm')
        .select('DISTINCT pm.masterContractId')
        .where('pm.status IN (:...statuses)', { statuses: [PerformanceStatus.BREACH, PerformanceStatus.CRITICAL] })
        .andWhere('pm.periodEnd >= :monthStart', { monthStart })
        .getCount(),

      this.performanceMetricRepository
        .createQueryBuilder('pm')
        .select('DISTINCT pm.masterContractId')
        .where('pm.status = :status', { status: PerformanceStatus.EXCELLENT })
        .andWhere('pm.periodEnd >= :monthStart', { monthStart })
        .getCount(),

      this.performanceMetricRepository.find({
        where: {
          periodStart: MoreThan(monthStart),
          periodEnd: LessThan(now),
        },
      }),

      this.performanceMetricRepository.count({
        where: {
          escalationTriggered: true,
          requiresAction: true,
        },
      }),

      this.contractRepository.count({
        where: {
          status: ContractStatus.ACTIVE,
          validUntil: Between(now, thirtyDaysFromNow),
        },
      }),
    ]);

    // Calculate averages from monthly metrics
    const deliveryMetrics = monthlyMetrics.filter(m => m.metricType === MetricType.DELIVERY_PERFORMANCE);
    const qualityMetrics = monthlyMetrics.filter(m => m.metricType === MetricType.QUALITY_PERFORMANCE);

    const avgDeliveryPerformance =
      deliveryMetrics.length > 0
        ? deliveryMetrics.reduce((sum, m) => sum + m.actualValue, 0) / deliveryMetrics.length
        : 0;

    const avgQualityPerformance =
      qualityMetrics.length > 0 ? qualityMetrics.reduce((sum, m) => sum + m.actualValue, 0) / qualityMetrics.length : 0;

    const totalPenaltiesThisMonth = monthlyMetrics.reduce((sum, m) => sum + m.penaltiesApplied, 0);
    const totalBonusesThisMonth = monthlyMetrics.reduce((sum, m) => sum + m.bonusesEarned, 0);

    return {
      totalActiveContracts,
      contractsAtRisk,
      contractsExcellent,
      totalPenaltiesThisMonth,
      totalBonusesThisMonth,
      avgDeliveryPerformance,
      avgQualityPerformance,
      pendingEscalations,
      contractsExpiringWithin30Days,
    };
  }

  /**
   * Generate recommendations based on performance metrics
   */
  private generateRecommendations(contract: MasterContract, metrics: ContractPerformanceMetric[]): string[] {
    const recommendations: string[] = [];

    const deliveryMetrics = metrics.filter(m => m.metricType === MetricType.DELIVERY_PERFORMANCE);
    const qualityMetrics = metrics.filter(m => m.metricType === MetricType.QUALITY_PERFORMANCE);

    // Delivery performance recommendations
    const poorDeliveryMetrics = deliveryMetrics.filter(
      m => m.status === PerformanceStatus.BREACH || m.status === PerformanceStatus.CRITICAL
    );
    if (poorDeliveryMetrics.length > 0) {
      recommendations.push('Review delivery processes and consider renegotiating SLA terms or switching suppliers');
      recommendations.push('Implement closer monitoring of delivery schedules and early warning systems');
    }

    // Quality performance recommendations
    const poorQualityMetrics = qualityMetrics.filter(
      m => m.status === PerformanceStatus.BREACH || m.status === PerformanceStatus.CRITICAL
    );
    if (poorQualityMetrics.length > 0) {
      recommendations.push('Conduct quality audit with supplier and establish improvement action plan');
      recommendations.push('Consider increasing quality inspections or implementing stricter acceptance criteria');
    }

    // Financial impact recommendations
    const totalPenalties = metrics.reduce((sum, m) => sum + m.penaltiesApplied, 0);
    if (totalPenalties > contract.volumeCommitment * 0.01) {
      // If penalties > 1% of volume commitment
      recommendations.push('High penalty costs detected - consider contract renegotiation or supplier change');
    }

    // Contract expiry recommendations
    if (contract.isExpiringSoon) {
      recommendations.push('Contract expires soon - initiate renewal negotiations or tender process');
    }

    return recommendations;
  }
}
