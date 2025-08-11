import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, Repository } from 'typeorm';

import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderProduct } from './entities/purchase-order-product.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationService } from '@common/services/pagination.service';
import { OrderStatus } from '@common/enums/order-status.enum';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderProduct)
    private purchaseOrderProductRepository: Repository<PurchaseOrderProduct>,
    private dataSource: DataSource,
    private paginationService: PaginationService
  ) {}

  async create(createPurchaseOrderDto: CreatePurchaseOrderDto, createdById?: string): Promise<PurchaseOrder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate PO number if not provided
      const poNumber = createPurchaseOrderDto.poNumber || (await this.generatePoNumber());

      // Calculate total amounts
      const totalAmountExcludingTax = createPurchaseOrderDto.orderProducts.reduce(
        (total, product) => total + product.quantity * product.unitPrice,
        0
      );

      // Create Purchase Order
      const purchaseOrder = queryRunner.manager.create(PurchaseOrder, {
        ...createPurchaseOrderDto,
        poNumber,
        totalAmountExcludingTax,
        totalAmountIncludingTax: totalAmountExcludingTax * 1.2, // Assuming 20% VAT
        currency: createPurchaseOrderDto.currency || 'EUR',
        orderDate: createPurchaseOrderDto.orderDate ? new Date(createPurchaseOrderDto.orderDate) : new Date(),
        requestedDeliveryDate: createPurchaseOrderDto.requestedDeliveryDate
          ? new Date(createPurchaseOrderDto.requestedDeliveryDate)
          : undefined,
        status: OrderStatus.ENREGISTREE,
        createdById,
      });

      const savedPurchaseOrder = await queryRunner.manager.save(purchaseOrder);

      // Create Order Products
      const orderProducts = createPurchaseOrderDto.orderProducts.map(productDto =>
        queryRunner.manager.create(PurchaseOrderProduct, {
          purchaseOrderId: savedPurchaseOrder.id,
          productId: productDto.productId,
          productSupplierId: productDto.productSupplierId,
          orderedQuantity: productDto.quantity,
          unitPrice: productDto.unitPrice,
          packagingUnit: productDto.packagingUnit,
          quantityPerPackage: productDto.quantityPerPackage,
          supplierReference: productDto.supplierReference,
          desiredDeliveryDate: productDto.desiredDeliveryDate ? new Date(productDto.desiredDeliveryDate) : undefined,
        })
      );

      await queryRunner.manager.save(PurchaseOrderProduct, orderProducts);

      await queryRunner.commitTransaction();

      // Return with relations
      return this.findOne(savedPurchaseOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const paginationOptions = this.paginationService.validatePaginationOptions({
      page: paginationDto.page || 1,
      limit: paginationDto.limit || 10,
      sortBy: paginationDto.sortBy || 'createdAt',
      sortOrder: paginationDto.sortOrder || 'DESC',
    });

    const queryBuilder = this.purchaseOrderRepository
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.station', 'station')
      .leftJoinAndSelect('po.supplier', 'supplier')
      .leftJoinAndSelect('po.masterOrder', 'masterOrder')
      .leftJoinAndSelect('po.platform', 'platform')
      .leftJoinAndSelect('po.deliveryStation', 'deliveryStation')
      .leftJoinAndSelect('po.orderProducts', 'orderProducts')
      .leftJoinAndSelect('orderProducts.product', 'product')
      .leftJoinAndSelect('orderProducts.productSupplier', 'productSupplier');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where('(po.poNumber ILIKE :search OR station.name ILIKE :search OR supplier.name ILIKE :search)', {
        search: `%${paginationDto.search}%`,
      });
    }

    // Add status filter
    if (paginationDto.status === 'active') {
      queryBuilder.andWhere('po.status NOT IN (:...inactiveStatuses)', {
        inactiveStatuses: [OrderStatus.ARCHIVEE],
      });
    } else if (paginationDto.status === 'inactive') {
      queryBuilder.andWhere('po.status = :archivedStatus', {
        archivedStatus: OrderStatus.ARCHIVEE,
      });
    }

    // Add role-based filtering
    if (paginationDto['stationId']) {
      queryBuilder.andWhere('po.stationId = :stationId', {
        stationId: paginationDto['stationId'],
      });
    }

    if (paginationDto['supplierId']) {
      queryBuilder.andWhere('po.supplierId = :supplierId', {
        supplierId: paginationDto['supplierId'],
      });
    }

    // Add buyer type filter
    if (paginationDto['buyerType']) {
      queryBuilder.andWhere('po.buyerType = :buyerType', {
        buyerType: paginationDto['buyerType'],
      });
    }

    // Add sorting and pagination
    queryBuilder
      .orderBy(`po.${paginationOptions.sortBy}`, paginationOptions.sortOrder)
      .skip(this.paginationService.getSkip(paginationOptions.page, paginationOptions.limit))
      .take(paginationOptions.limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return this.paginationService.createPaginatedResponse(data, total, paginationOptions);
  }

  async findOne(id: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: [
        'station',
        'supplier',
        'masterOrder',
        'platform',
        'deliveryStation',
        'orderProducts',
        'orderProducts.product',
        'orderProducts.productSupplier',
        'orderProducts.productSupplier.supplier',
        'createdBy',
        'approvedBy',
        'linkedSalesOrder',
      ],
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase Order not found');
    }

    return purchaseOrder;
  }

  async update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    // Handle date conversions and create entity update data
    const entityUpdateData: any = { ...updatePurchaseOrderDto };
    if (updatePurchaseOrderDto.requestedDeliveryDate) {
      entityUpdateData.requestedDeliveryDate = new Date(updatePurchaseOrderDto.requestedDeliveryDate);
    }
    if (updatePurchaseOrderDto.confirmedDeliveryDate) {
      entityUpdateData.confirmedDeliveryDate = new Date(updatePurchaseOrderDto.confirmedDeliveryDate);
    }
    if (updatePurchaseOrderDto.actualDeliveryDate) {
      entityUpdateData.actualDeliveryDate = new Date(updatePurchaseOrderDto.actualDeliveryDate);
    }
    if (updatePurchaseOrderDto.approvedAt) {
      entityUpdateData.approvedAt = new Date(updatePurchaseOrderDto.approvedAt);
    }

    Object.assign(purchaseOrder, entityUpdateData);
    return this.purchaseOrderRepository.save(purchaseOrder);
  }

  async updateStatus(id: string, status: OrderStatus, userId?: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    // Validate status transition
    this.validateStatusTransition(purchaseOrder.status, status);

    purchaseOrder.status = status;

    // Set timestamps based on status
    switch (status) {
      case OrderStatus.CONFIRMEE:
        if (!purchaseOrder.confirmedDeliveryDate && purchaseOrder.requestedDeliveryDate) {
          purchaseOrder.confirmedDeliveryDate = purchaseOrder.requestedDeliveryDate;
        }
        break;
      case OrderStatus.RECEPTIONNEE:
        if (!purchaseOrder.actualDeliveryDate) {
          purchaseOrder.actualDeliveryDate = new Date();
        }
        if (!purchaseOrder.deliveredAt) {
          purchaseOrder.deliveredAt = new Date();
        }
        break;
      case OrderStatus.CONFIRMEE:
        if (userId && !purchaseOrder.approvedById) {
          purchaseOrder.approvedById = userId;
          purchaseOrder.approvedAt = new Date();
        }
        break;
    }

    return this.purchaseOrderRepository.save(purchaseOrder);
  }

  async approve(id: string, userId: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    if (purchaseOrder.status !== OrderStatus.ENREGISTREE) {
      throw new BadRequestException('Only registered purchase orders can be approved');
    }

    purchaseOrder.status = OrderStatus.CONFIRMEE;
    purchaseOrder.approvedById = userId;
    purchaseOrder.approvedAt = new Date();

    return this.purchaseOrderRepository.save(purchaseOrder);
  }

  async remove(id: string): Promise<void> {
    const purchaseOrder = await this.findOne(id);

    if (purchaseOrder.status !== OrderStatus.ENREGISTREE) {
      throw new BadRequestException('Only registered purchase orders can be deleted');
    }

    await this.purchaseOrderRepository.remove(purchaseOrder);
  }

  // Statistics methods
  async getOrdersByStation(stationId: string, paginationDto: PaginationDto) {
    const modifiedPagination = { ...paginationDto, stationId };
    return this.findAll(modifiedPagination);
  }

  async getOrdersBySupplier(supplierId: string, paginationDto: PaginationDto) {
    const modifiedPagination = { ...paginationDto, supplierId };
    return this.findAll(modifiedPagination);
  }

  async getOrderStats(filters?: { stationId?: string; supplierId?: string; startDate?: Date; endDate?: Date }) {
    const queryBuilder = this.purchaseOrderRepository.createQueryBuilder('po');

    if (filters?.stationId) {
      queryBuilder.andWhere('po.stationId = :stationId', { stationId: filters.stationId });
    }

    if (filters?.supplierId) {
      queryBuilder.andWhere('po.supplierId = :supplierId', { supplierId: filters.supplierId });
    }

    if (filters?.startDate) {
      queryBuilder.andWhere('po.orderDate >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere('po.orderDate <= :endDate', { endDate: filters.endDate });
    }

    const [totalOrders, totalAmount] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.select('SUM(po.totalAmountExcludingTax)', 'total').getRawOne(),
    ]);

    const statusStats = await this.purchaseOrderRepository
      .createQueryBuilder('po')
      .select('po.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('po.status')
      .getRawMany();

    return {
      totalOrders,
      totalAmount: parseFloat(totalAmount?.total || '0'),
      statusBreakdown: statusStats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.count);
        return acc;
      }, {}),
    };
  }

  // Utility methods
  private async generatePoNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.purchaseOrderRepository.count({
      where: {
        poNumber: Like(`PO-${year}-%`),
      },
    });
    return `PO-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions = {
      [OrderStatus.ENREGISTREE]: [OrderStatus.CONFIRMEE, OrderStatus.ARCHIVEE],
      [OrderStatus.CONFIRMEE]: [OrderStatus.EXPEDIEE, OrderStatus.ARCHIVEE],
      [OrderStatus.EXPEDIEE]: [OrderStatus.RECEPTIONNEE, OrderStatus.ARCHIVEE],
      [OrderStatus.RECEPTIONNEE]: [OrderStatus.CLOTUREE, OrderStatus.ARCHIVEE],
      [OrderStatus.CLOTUREE]: [OrderStatus.FACTUREE, OrderStatus.ARCHIVEE],
      [OrderStatus.FACTUREE]: [OrderStatus.ARCHIVEE],
      [OrderStatus.ARCHIVEE]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(`Invalid status transition: ${currentStatus} to ${newStatus}`);
    }
  }
}
