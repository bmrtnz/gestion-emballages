import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SalesOrder } from './entities/sales-order.entity';
import { SalesOrderProduct } from './entities/sales-order-product.entity';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationService } from '@common/services/pagination.service';
import { OrderStatus } from '@common/enums/order-status.enum';

@Injectable()
export class SalesOrdersService {
  private readonly logger = new Logger(SalesOrdersService.name);

  constructor(
    @InjectRepository(SalesOrder)
    private salesOrderRepository: Repository<SalesOrder>,
    @InjectRepository(SalesOrderProduct)
    private salesOrderProductRepository: Repository<SalesOrderProduct>,
    private dataSource: DataSource,
    private paginationService: PaginationService
  ) {}

  async create(createSalesOrderDto: CreateSalesOrderDto, createdById?: string): Promise<SalesOrder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate SO number if not provided
      const soNumber = createSalesOrderDto.soNumber || (await this.generateSoNumber());

      // Calculate order totals
      const { subtotal, totalTax, total } = this.calculateOrderTotals(createSalesOrderDto.salesOrderProducts);
      const platformFees = createSalesOrderDto.platformFees || 0;

      // Create sales order
      const salesOrder = queryRunner.manager.create(SalesOrder, {
        soNumber,
        customerStationId: createSalesOrderDto.customerStationId,
        customerPoNumber: createSalesOrderDto.customerPoNumber,
        fulfillmentPlatformId: createSalesOrderDto.fulfillmentPlatformId,
        deliveryAddress: createSalesOrderDto.deliveryAddress,
        orderDate: createSalesOrderDto.orderDate ? new Date(createSalesOrderDto.orderDate) : new Date(),
        promisedDeliveryDate: createSalesOrderDto.promisedDeliveryDate
          ? new Date(createSalesOrderDto.promisedDeliveryDate)
          : null,
        subtotalAmount: subtotal,
        platformFees,
        totalAmountExcludingTax: subtotal + platformFees,
        taxAmount: totalTax,
        totalAmountIncludingTax: total + platformFees,
        currency: createSalesOrderDto.currency || 'EUR',
        notes: createSalesOrderDto.notes,
        paymentTerms: createSalesOrderDto.paymentTerms,
        carrierName: createSalesOrderDto.carrierName,
        createdById,
        status: OrderStatus.ENREGISTREE,
      });

      const savedSalesOrder = await queryRunner.manager.save(SalesOrder, salesOrder);

      // Create sales order products
      const salesOrderProducts = createSalesOrderDto.salesOrderProducts.map(productDto => {
        const lineTotal = productDto.quantity * productDto.unitPrice - (productDto.discountAmount || 0);
        const taxRate = productDto.taxRate || 20;
        const taxAmount = lineTotal * (taxRate / 100);
        const lineTotalWithTax = lineTotal + taxAmount;

        return queryRunner.manager.create(SalesOrderProduct, {
          salesOrderId: savedSalesOrder.id,
          productId: productDto.productId,
          lineNumber: productDto.lineNumber,
          quantity: productDto.quantity,
          unitPrice: productDto.unitPrice,
          discountPercent: productDto.discountPercent || 0,
          discountAmount: productDto.discountAmount || 0,
          lineTotal,
          taxRate,
          taxAmount,
          lineTotalWithTax,
          stockLocation: productDto.stockLocation,
          batchNumber: productDto.batchNumber,
          expiryDate: productDto.expiryDate ? new Date(productDto.expiryDate) : null,
          notes: productDto.notes,
        });
      });

      await queryRunner.manager.save(SalesOrderProduct, salesOrderProducts);

      await queryRunner.commitTransaction();

      this.logger.log(`Sales order created: ${soNumber}`);
      return this.findOne(savedSalesOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create sales order: ${error.message}`, error.stack);
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

    const queryBuilder = this.salesOrderRepository
      .createQueryBuilder('so')
      .leftJoinAndSelect('so.customerStation', 'customerStation')
      .leftJoinAndSelect('so.fulfillmentPlatform', 'fulfillmentPlatform')
      .leftJoinAndSelect('so.createdBy', 'createdBy')
      .leftJoinAndSelect('so.salesOrderProducts', 'salesOrderProducts')
      .leftJoinAndSelect('salesOrderProducts.product', 'product');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(so.soNumber ILIKE :search OR so.customerPoNumber ILIKE :search OR customerStation.name ILIKE :search)',
        { search: `%${paginationDto.search}%` }
      );
    }

    // Add status filter
    if (paginationDto['status']) {
      queryBuilder.andWhere('so.status = :status', { status: paginationDto['status'] });
    }

    // Add customer station filter
    if (paginationDto['customerStationId']) {
      queryBuilder.andWhere('so.customerStationId = :customerStationId', {
        customerStationId: paginationDto['customerStationId'],
      });
    }

    // Add platform filter
    if (paginationDto['fulfillmentPlatformId']) {
      queryBuilder.andWhere('so.fulfillmentPlatformId = :platformId', {
        platformId: paginationDto['fulfillmentPlatformId'],
      });
    }

    // Add sorting and pagination
    queryBuilder
      .orderBy(`so.${paginationOptions.sortBy}`, paginationOptions.sortOrder)
      .skip(this.paginationService.getSkip(paginationOptions.page, paginationOptions.limit))
      .take(paginationOptions.limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return this.paginationService.createPaginatedResponse(data, total, paginationOptions);
  }

  async findOne(id: string): Promise<SalesOrder> {
    const salesOrder = await this.salesOrderRepository.findOne({
      where: { id },
      relations: [
        'customerStation',
        'fulfillmentPlatform',
        'createdBy',
        'fulfilledBy',
        'salesOrderProducts',
        'salesOrderProducts.product',
        'linkedPurchaseOrder',
      ],
    });

    if (!salesOrder) {
      throw new NotFoundException('Sales order not found');
    }

    return salesOrder;
  }

  async update(id: string, updateSalesOrderDto: UpdateSalesOrderDto): Promise<SalesOrder> {
    const salesOrder = await this.findOne(id);

    // Convert date strings to Date objects for entity update
    const entityUpdateData: any = { ...updateSalesOrderDto };
    if (updateSalesOrderDto.actualShipDate) {
      entityUpdateData.actualShipDate = new Date(updateSalesOrderDto.actualShipDate);
    }
    if (updateSalesOrderDto.actualDeliveryDate) {
      entityUpdateData.actualDeliveryDate = new Date(updateSalesOrderDto.actualDeliveryDate);
    }
    if (updateSalesOrderDto.invoiceDate) {
      entityUpdateData.invoiceDate = new Date(updateSalesOrderDto.invoiceDate);
    }
    if (updateSalesOrderDto.paymentDueDate) {
      entityUpdateData.paymentDueDate = new Date(updateSalesOrderDto.paymentDueDate);
    }
    if (updateSalesOrderDto.paymentReceivedDate) {
      entityUpdateData.paymentReceivedDate = new Date(updateSalesOrderDto.paymentReceivedDate);
    }
    if (updateSalesOrderDto.fulfilledAt) {
      entityUpdateData.fulfilledAt = new Date(updateSalesOrderDto.fulfilledAt);
    }

    Object.assign(salesOrder, entityUpdateData);

    const updatedSalesOrder = await this.salesOrderRepository.save(salesOrder);

    this.logger.log(`Sales order updated: ${salesOrder.soNumber}`);
    return this.findOne(updatedSalesOrder.id);
  }

  async updateStatus(id: string, status: OrderStatus, userId?: string): Promise<SalesOrder> {
    const salesOrder = await this.findOne(id);

    const updateData: Partial<SalesOrder> = { status };

    // Set fulfillment timestamp and user when marking as fulfilled
    if (status === OrderStatus.RECEPTIONNEE && !salesOrder.fulfilledAt) {
      updateData.fulfilledAt = new Date();
      updateData.fulfilledById = userId;
    }

    Object.assign(salesOrder, updateData);
    const updatedSalesOrder = await this.salesOrderRepository.save(salesOrder);

    this.logger.log(`Sales order status updated: ${salesOrder.soNumber} -> ${status}`);
    return this.findOne(updatedSalesOrder.id);
  }

  async updateProductFulfillment(
    salesOrderId: string,
    productId: string,
    fulfillmentData: {
      quantityShipped?: number;
      quantityDelivered?: number;
      fulfillmentStatus?: 'PENDING' | 'PICKED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    }
  ): Promise<SalesOrderProduct> {
    const salesOrderProduct = await this.salesOrderProductRepository.findOne({
      where: { salesOrderId, productId },
    });

    if (!salesOrderProduct) {
      throw new NotFoundException('Sales order product not found');
    }

    Object.assign(salesOrderProduct, fulfillmentData);

    const updatedProduct = await this.salesOrderProductRepository.save(salesOrderProduct);

    this.logger.log(`Sales order product fulfillment updated: ${salesOrderId}/${productId}`);
    return updatedProduct;
  }

  async generateInvoice(id: string): Promise<SalesOrder> {
    const salesOrder = await this.findOne(id);

    if (salesOrder.invoiceNumber) {
      throw new BadRequestException('Invoice already generated for this sales order');
    }

    const invoiceNumber = await this.generateInvoiceNumber();
    const invoiceDate = new Date();

    // Calculate payment due date (typically 30 days)
    const paymentDueDate = new Date();
    paymentDueDate.setDate(paymentDueDate.getDate() + 30);

    salesOrder.invoiceNumber = invoiceNumber;
    salesOrder.invoiceDate = invoiceDate;
    salesOrder.invoiceStatus = 'DRAFT';
    salesOrder.paymentDueDate = paymentDueDate;

    const updatedSalesOrder = await this.salesOrderRepository.save(salesOrder);

    this.logger.log(`Invoice generated for sales order: ${salesOrder.soNumber} -> ${invoiceNumber}`);
    return this.findOne(updatedSalesOrder.id);
  }

  async delete(id: string): Promise<void> {
    const salesOrder = await this.findOne(id);

    if (salesOrder.status !== OrderStatus.ENREGISTREE) {
      throw new BadRequestException('Only sales orders with status ENREGISTREE can be deleted');
    }

    // Delete products first (cascade should handle this, but being explicit)
    await this.salesOrderProductRepository.delete({ salesOrderId: id });

    // Delete the sales order
    await this.salesOrderRepository.remove(salesOrder);

    this.logger.log(`Sales order deleted: ${salesOrder.soNumber}`);
  }

  // Utility methods
  private calculateOrderTotals(
    products: Array<{
      quantity: number;
      unitPrice: number;
      discountAmount?: number;
      taxRate?: number;
    }>
  ): { subtotal: number; totalTax: number; total: number } {
    let subtotal = 0;
    let totalTax = 0;

    for (const product of products) {
      const lineTotal = product.quantity * product.unitPrice - (product.discountAmount || 0);
      const taxRate = product.taxRate || 20;
      const taxAmount = lineTotal * (taxRate / 100);

      subtotal += lineTotal;
      totalTax += taxAmount;
    }

    return {
      subtotal,
      totalTax,
      total: subtotal + totalTax,
    };
  }

  private async generateSoNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.salesOrderRepository
      .createQueryBuilder('order')
      .where('order.soNumber LIKE :pattern', { pattern: `SO-${year}-%` })
      .getCount();
    return `SO-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.salesOrderRepository
      .createQueryBuilder('order')
      .where('order.invoiceNumber LIKE :pattern', { pattern: `INV-${year}-%` })
      .getCount();
    return `INV-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }

  // Analytics methods
  async getSalesOrderAnalytics(platformId?: string) {
    const queryBuilder = this.salesOrderRepository
      .createQueryBuilder('so')
      .leftJoinAndSelect('so.salesOrderProducts', 'products');

    if (platformId) {
      queryBuilder.where('so.fulfillmentPlatformId = :platformId', { platformId });
    }

    const salesOrders = await queryBuilder.getMany();

    const totalOrders = salesOrders.length;
    const totalRevenue = salesOrders.reduce((sum, order) => sum + order.totalAmountIncludingTax, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const ordersByStatus = salesOrders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalItems = salesOrders.reduce(
      (sum, order) => sum + order.salesOrderProducts.reduce((itemSum, product) => itemSum + product.quantity, 0),
      0
    );

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      totalItems,
      ordersByStatus,
    };
  }
}
