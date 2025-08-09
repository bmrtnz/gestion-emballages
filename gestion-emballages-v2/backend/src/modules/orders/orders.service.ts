import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';

import { Order } from './entities/order.entity';
import { MasterOrder } from './entities/master-order.entity';
import { OrderProduct } from './entities/order-product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-Order.dto';
import { CreateMasterOrderDto } from './dto/create-master-order.dto';
import { UpdateMasterOrderDto } from './dto/update-master-order.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationService } from '@common/services/pagination.service';
import { OrderStatus } from '@common/enums/order-status.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private commandeRepository: Repository<Order>,
    @InjectRepository(MasterOrder)
    private commandeGlobaleRepository: Repository<MasterOrder>,
    @InjectRepository(OrderProduct)
    private commandeArticleRepository: Repository<OrderProduct>,
    private dataSource: DataSource,
    private paginationService: PaginationService,
  ) {}

  // Commandes individuelles
  async createCommande(CreateOrderDto: CreateOrderDto, createdById?: string): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate unique order number
      const numeroCommande = await this.generateNumeroCommande();

      // Calculate total amount
      const montantTotalHt = CreateOrderDto.commandeArticles.reduce(
        (total, Product) => total + (Product.quantiteCommandee * Product.unitPrice),
        0
      );

      // Create Order
      const order = queryRunner.manager.create(Order, {
        ...CreateOrderDto,
        numeroCommande,
        montantTotalHt,
        createdById,
        expectedDeliveryDate: CreateOrderDto.expectedDeliveryDate 
          ? new Date(CreateOrderDto.expectedDeliveryDate) 
          : null,
      });

      const savedCommande = await queryRunner.manager.save(order);

      // Create Order articles
      const commandeArticles = CreateOrderDto.commandeArticles.map(articleDto => 
        queryRunner.manager.create(OrderProduct, {
          ...articleDto,
          commandeId: savedCommande.id,
          dateSouhaitee_livraison: articleDto.dateSouhaitee_livraison 
            ? new Date(articleDto.dateSouhaitee_livraison) 
            : null,
        })
      );

      await queryRunner.manager.save(OrderProduct, commandeArticles);

      await queryRunner.commitTransaction();

      // Return with relations
      return this.findOneCommande(savedCommande.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllCommandes(paginationDto: PaginationDto) {
    const paginationOptions = this.paginationService.validatePaginationOptions({
      page: paginationDto.page || 1,
      limit: paginationDto.limit || 10,
      sortBy: paginationDto.sortBy || 'createdAt',
      sortOrder: paginationDto.sortOrder || 'DESC'
    });

    const queryBuilder = this.commandeRepository
      .createQueryBuilder('Order')
      .leftJoinAndSelect('Order.station', 'station')
      .leftJoinAndSelect('Order.Supplier', 'Supplier')
      .leftJoinAndSelect('Order.masterOrder', 'masterOrder')
      .leftJoinAndSelect('Order.commandeArticles', 'commandeArticles')
      .leftJoinAndSelect('commandeArticles.Product', 'Product')
      .leftJoinAndSelect('commandeArticles.ProductSupplier', 'ProductSupplier');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(Order.numeroCommande ILIKE :search OR station.name ILIKE :search OR Supplier.name ILIKE :search)',
        { search: `%${paginationDto.search}%` }
      );
    }

    // Add status filter
    if (paginationDto.status === 'active') {
      queryBuilder.andWhere('Order.status NOT IN (:...inactiveStatuses)', { 
        inactiveStatuses: [OrderStatus.ARCHIVEE] 
      });
    } else if (paginationDto.status === 'inactive') {
      queryBuilder.andWhere('Order.status = :archivedStatus', { 
        archivedStatus: OrderStatus.ARCHIVEE 
      });
    }

    // Add role-based filtering
    if (paginationDto['stationId']) {
      queryBuilder.andWhere('Order.stationId = :stationId', { 
        stationId: paginationDto['stationId'] 
      });
    }

    if (paginationDto['fournisseurId']) {
      queryBuilder.andWhere('Order.supplierId = :fournisseurId', { 
        supplierId: paginationDto['fournisseurId'] 
      });
    }

    // Add status filter
    if (paginationDto['status']) {
      queryBuilder.andWhere('Order.status = :status', { 
        status: paginationDto['status'] 
      });
    }

    // Add sorting and pagination
    queryBuilder
      .orderBy(`Order.${paginationOptions.sortBy}`, paginationOptions.sortOrder)
      .skip(this.paginationService.getSkip(paginationOptions.page, paginationOptions.limit))
      .take(paginationOptions.limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return this.paginationService.createPaginatedResponse(data, total, paginationOptions);
  }

  async findOneCommande(id: string): Promise<Order> {
    const Order = await this.commandeRepository.findOne({
      where: { id },
      relations: [
        'station',
        'Supplier',
        'masterOrder',
        'commandeArticles',
        'commandeArticles.Product',
        'commandeArticles.ProductSupplier',
        'commandeArticles.ProductSupplier.Supplier',
        'createdBy'
      ]
    });

    if (!Order) {
      throw new NotFoundException('Order non trouvée');
    }

    return Order;
  }

  async updateCommande(id: string, UpdateOrderDto: UpdateOrderDto): Promise<Order> {
    const Order = await this.findOneCommande(id);

    // Update dates if provided
    if (UpdateOrderDto.expectedDeliveryDate) {
      UpdateOrderDto.expectedDeliveryDate = new Date(UpdateOrderDto.expectedDeliveryDate) as any;
    }
    if (UpdateOrderDto.actualDeliveryDate) {
      UpdateOrderDto.actualDeliveryDate = new Date(UpdateOrderDto.actualDeliveryDate) as any;
    }

    Object.assign(Order, UpdateOrderDto);
    return this.commandeRepository.save(Order);
  }

  async updateCommandeStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOneCommande(id);
    
    // Validate status transition
    this.validateStatusTransition(order.status, status);

    order.status = status;
    
    // Set delivery date when received
    if (status === OrderStatus.RECEPTIONNEE && !order.actualDeliveryDate) {
      order.actualDeliveryDate = new Date();
    }

    return this.commandeRepository.save(order);
  }

  async deleteCommande(id: string): Promise<void> {
    const Order = await this.findOneCommande(id);
    
    if (Order.status !== OrderStatus.ENREGISTREE) {
      throw new BadRequestException('Seules les commandes enregistrées peuvent être supprimées');
    }

    await this.commandeRepository.remove(Order);
  }

  // Commandes globales
  async createCommandeGlobale(CreateMasterOrderDto: CreateMasterOrderDto, createdById?: string): Promise<MasterOrder> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate unique reference
      const referenceGlobale = await this.generateReferenceGlobale();

      // Create Order globale
      const globalOrder = queryRunner.manager.create(MasterOrder, {
        referenceGlobale,
        stationId: CreateMasterOrderDto.stationId,
        statutGeneral: CreateMasterOrderDto.generalStatus || OrderStatus.ENREGISTREE,
        totalAmountExcludingTax: 0,
        createdById,
      });

      const savedCommandeGlobale = await queryRunner.manager.save(globalOrder);

      // Create individual commandes
      let totalAmount = 0;
      for (const commandeDto of CreateMasterOrderDto.orders) {
        const commandeAmount = commandeDto.commandeArticles.reduce(
          (total, Product) => total + (Product.quantiteCommandee * Product.unitPrice),
          0
        );
        totalAmount += commandeAmount;

        const numeroCommande = await this.generateNumeroCommande();
        
        const order = queryRunner.manager.create(Order, {
          ...commandeDto,
          stationId: CreateMasterOrderDto.stationId,
          globalOrderId: savedCommandeGlobale.id,
          numeroCommande,
          totalAmountExcludingTax: commandeAmount,
          createdById,
          expectedDeliveryDate: commandeDto.expectedDeliveryDate 
            ? new Date(commandeDto.expectedDeliveryDate) 
            : null,
        });

        const savedCommande = await queryRunner.manager.save(order);

        // Create Order articles
        const commandeArticles = commandeDto.commandeArticles.map(articleDto => 
          queryRunner.manager.create(OrderProduct, {
            ...articleDto,
            commandeId: savedCommande.id,
            dateSouhaitee_livraison: articleDto.dateSouhaitee_livraison 
              ? new Date(articleDto.dateSouhaitee_livraison) 
              : null,
          })
        );

        await queryRunner.manager.save(OrderProduct, commandeArticles);
      }

      // Update total amount
      savedCommandeGlobale.totalAmountExcludingTax = totalAmount;
      await queryRunner.manager.save(MasterOrder, savedCommandeGlobale);

      await queryRunner.commitTransaction();

      // Return with relations
      return this.findOneCommandeGlobale(savedCommandeGlobale.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllCommandesGlobales(paginationDto: PaginationDto) {
    const paginationOptions = this.paginationService.validatePaginationOptions({
      page: paginationDto.page || 1,
      limit: paginationDto.limit || 10,
      sortBy: paginationDto.sortBy || 'createdAt',
      sortOrder: paginationDto.sortOrder || 'DESC'
    });

    const queryBuilder = this.commandeGlobaleRepository
      .createQueryBuilder('MasterOrder')
      .leftJoinAndSelect('MasterOrder.station', 'station')
      .leftJoinAndSelect('MasterOrder.commandes', 'commandes')
      .leftJoinAndSelect('commandes.Supplier', 'Supplier');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(MasterOrder.referenceMaster ILIKE :search OR station.name ILIKE :search)',
        { search: `%${paginationDto.search}%` }
      );
    }

    // Add status filter
    if (paginationDto.status === 'active') {
      queryBuilder.andWhere('MasterOrder.statutGeneral NOT IN (:...inactiveStatuses)', { 
        inactiveStatuses: [OrderStatus.ARCHIVEE] 
      });
    } else if (paginationDto.status === 'inactive') {
      queryBuilder.andWhere('MasterOrder.statutGeneral = :archivedStatus', { 
        archivedStatus: OrderStatus.ARCHIVEE 
      });
    }

    // Add role-based filtering
    if (paginationDto['stationId']) {
      queryBuilder.andWhere('MasterOrder.stationId = :stationId', { 
        stationId: paginationDto['stationId'] 
      });
    }

    // Add status filter
    if (paginationDto['status']) {
      queryBuilder.andWhere('MasterOrder.statutGeneral = :status', { 
        status: paginationDto['status'] 
      });
    }

    // Add sorting and pagination
    queryBuilder
      .orderBy(`MasterOrder.${paginationOptions.sortBy}`, paginationOptions.sortOrder)
      .skip(this.paginationService.getSkip(paginationOptions.page, paginationOptions.limit))
      .take(paginationOptions.limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return this.paginationService.createPaginatedResponse(data, total, paginationOptions);
  }

  async findOneCommandeGlobale(id: string): Promise<MasterOrder> {
    const masterOrder = await this.commandeGlobaleRepository.findOne({
      where: { id },
      relations: [
        'station',
        'commandes',
        'commandes.Supplier',
        'commandes.commandeArticles',
        'commandes.commandeArticles.Product',
        'commandes.commandeArticles.ProductSupplier',
        'createdBy'
      ]
    });

    if (!masterOrder) {
      throw new NotFoundException('Order globale non trouvée');
    }

    return masterOrder;
  }

  async updateCommandeGlobale(id: string, UpdateMasterOrderDto: UpdateMasterOrderDto): Promise<MasterOrder> {
    const masterOrder = await this.findOneCommandeGlobale(id);

    Object.assign(masterOrder, UpdateMasterOrderDto);
    return this.commandeGlobaleRepository.save(masterOrder);
  }

  async updateCommandeGlobaleStatus(id: string, generalStatus: OrderStatus): Promise<MasterOrder> {
    const masterOrder = await this.findOneCommandeGlobale(id);
    
    masterOrder.statutGeneral = generalStatus;
    return this.commandeGlobaleRepository.save(masterOrder);
  }

  async deleteCommandeGlobale(id: string): Promise<void> {
    const masterOrder = await this.findOneCommandeGlobale(id);
    
    if (masterOrder.statutGeneral !== OrderStatus.ENREGISTREE) {
      throw new BadRequestException('Seules les commandes globales enregistrées peuvent être supprimées');
    }

    await this.commandeGlobaleRepository.remove(masterOrder);
  }

  // Utility methods
  private async generateNumeroCommande(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.commandeRepository.count({
      where: {
        orderNumber: Like(`CMD-${year}-%`)
      }
    });
    return `CMD-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }

  private async generateReferenceGlobale(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.commandeGlobaleRepository.count({
      where: {
        referenceMaster: Like(`CGL-${year}-%`)
      }
    });
    return `CGL-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions = {
      [OrderStatus.ENREGISTREE]: [OrderStatus.CONFIRMEE, OrderStatus.ARCHIVEE],
      [OrderStatus.CONFIRMEE]: [OrderStatus.EXPEDIEE, OrderStatus.ARCHIVEE],
      [OrderStatus.EXPEDIEE]: [OrderStatus.RECEPTIONNEE, OrderStatus.ARCHIVEE],
      [OrderStatus.RECEPTIONNEE]: [OrderStatus.CLOTUREE, OrderStatus.ARCHIVEE],
      [OrderStatus.CLOTUREE]: [OrderStatus.FACTUREE, OrderStatus.ARCHIVEE],
      [OrderStatus.FACTUREE]: [OrderStatus.ARCHIVEE],
      [OrderStatus.ARCHIVEE]: []
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Transition de statut invalide: ${currentStatus} vers ${newStatus}`
      );
    }
  }
}