import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { ShoppingCart } from './entities/shopping-cart.entity';
import { ShoppingCartItem } from './entities/shopping-cart-item.entity';
import { CreateShoppingCartDto } from './dto/create-shopping-cart.dto';
import { UpdateShoppingCartDto, AddItemToShoppingCartDto, ValidateShoppingCartDto } from './dto/update-shopping-cart.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationService } from '@common/services/pagination.service';

// Import related entities for validation
import { Product } from '@modules/products/entities/product.entity';
import { Supplier } from '@modules/suppliers/entities/supplier.entity';
import { Station } from '@modules/stations/entities/station.entity';
import { Order } from '@modules/orders/entities/order.entity';
import { OrderProduct } from '@modules/orders/entities/order-product.entity';
import { OrderStatus } from '@common/enums/order-status.enum';

@Injectable()
export class ShoppingCartsService {
  constructor(
    @InjectRepository(ShoppingCart)
    private listeAchatRepository: Repository<ShoppingCart>,
    @InjectRepository(ShoppingCartItem)
    private listeAchatItemRepository: Repository<ShoppingCartItem>,
    @InjectRepository(Product)
    private articleRepository: Repository<Product>,
    @InjectRepository(Supplier)
    private fournisseurRepository: Repository<Supplier>,
    @InjectRepository(Station)
    private stationRepository: Repository<Station>,
    @InjectRepository(Order)
    private commandeRepository: Repository<Order>,
    @InjectRepository(OrderProduct)
    private commandeArticleRepository: Repository<OrderProduct>,
    private dataSource: DataSource,
    private paginationService: PaginationService,
  ) {}

  async create(CreateShoppingCartDto: CreateShoppingCartDto, createdById?: string): Promise<ShoppingCart> {
    // Verify station exists
    const station = await this.stationRepository.findOne({
      where: { id: CreateShoppingCartDto.stationId }
    });

    if (!station) {
      throw new NotFoundException('Station non trouvée');
    }

    // Check if station already has an active shopping list
    const existingListe = await this.listeAchatRepository.findOne({
      where: { 
        stationId: CreateShoppingCartDto.stationId,
        status: 'active'
      }
    });

    if (existingListe) {
      throw new BadRequestException('La station a déjà une liste d\'achat active');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create shopping list
      const shoppingCart = queryRunner.manager.create(ShoppingCart, {
        ...CreateShoppingCartDto,
        createdById,
      });

      const savedListeAchat = await queryRunner.manager.save(shoppingCart);

      // Create items if provided
      if (CreateShoppingCartDto.items && CreateShoppingCartDto.items.length > 0) {
        await this.validateItems(CreateShoppingCartDto.items);

        const items = CreateShoppingCartDto.items.map(itemDto => 
          queryRunner.manager.create(ShoppingCartItem, {
            ...itemDto,
            shoppingCartId: savedListeAchat.id,
            desiredDeliveryDate: itemDto.desiredDeliveryDate ? new Date(itemDto.desiredDeliveryDate) : undefined
          })
        );

        await queryRunner.manager.save(ShoppingCartItem, items);
      }

      await queryRunner.commitTransaction();

      return this.findOne(savedListeAchat.id);
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
      sortOrder: paginationDto.sortOrder || 'DESC'
    });

    const queryBuilder = this.listeAchatRepository
      .createQueryBuilder('liste')
      .leftJoinAndSelect('liste.station', 'station')
      .leftJoinAndSelect('liste.createdBy', 'createdBy')
      .leftJoinAndSelect('liste.items', 'items')
      .leftJoinAndSelect('items.Product', 'Product')
      .leftJoinAndSelect('items.Supplier', 'Supplier');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(station.name ILIKE :search OR station.ville ILIKE :search)',
        { search: `%${paginationDto.search}%` }
      );
    }

    // Add status filter
    if (paginationDto.status === 'active') {
      queryBuilder.andWhere('liste.status = :status', { status: 'active' });
    } else if (paginationDto.status === 'inactive') {
      queryBuilder.andWhere('liste.status != :status', { status: 'active' });
    }

    // Add station filter for role-based access
    if (paginationDto['stationId']) {
      queryBuilder.andWhere('liste.stationId = :stationId', { 
        stationId: paginationDto['stationId'] 
      });
    }

    // Add sorting and pagination
    queryBuilder
      .orderBy(`liste.${paginationOptions.sortBy}`, paginationOptions.sortOrder)
      .skip(this.paginationService.getSkip(paginationOptions.page, paginationOptions.limit))
      .take(paginationOptions.limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return this.paginationService.createPaginatedResponse(data, total, paginationOptions);
  }

  async findOne(id: string): Promise<ShoppingCart> {
    const ShoppingCart = await this.listeAchatRepository.findOne({
      where: { id },
      relations: [
        'station',
        'createdBy',
        'items',
        'items.Product',
        'items.Supplier'
      ]
    });

    if (!ShoppingCart) {
      throw new NotFoundException('Liste d\'achat non trouvée');
    }

    return ShoppingCart;
  }

  async findActiveByStation(stationId: string): Promise<ShoppingCart | null> {
    return this.listeAchatRepository.findOne({
      where: { 
        stationId,
        status: 'active'
      },
      relations: [
        'station',
        'createdBy',
        'items',
        'items.Product',
        'items.Supplier'
      ]
    });
  }

  async update(id: string, UpdateShoppingCartDto: UpdateShoppingCartDto): Promise<ShoppingCart> {
    const ShoppingCart = await this.findOne(id);

    // Only allow updates for active lists
    if (ShoppingCart.status !== 'active') {
      throw new BadRequestException('Seules les listes actives peuvent être modifiées');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update list properties
      Object.assign(ShoppingCart, UpdateShoppingCartDto);
      await queryRunner.manager.save(ShoppingCart);

      // Update items if provided
      if (UpdateShoppingCartDto.items) {
        await this.validateItems(UpdateShoppingCartDto.items);

        // Delete existing items
        await queryRunner.manager.delete(ShoppingCartItem, { 
          listeAchatId: id 
        });

        // Create new items
        const items = UpdateShoppingCartDto.items.map(itemDto => 
          queryRunner.manager.create(ShoppingCartItem, {
            ...itemDto,
            listeAchatId: id,
            desiredDeliveryDate: itemDto.desiredDeliveryDate ? new Date(itemDto.desiredDeliveryDate) : undefined
          })
        );

        await queryRunner.manager.save(ShoppingCartItem, items);
      }

      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addItem(id: string, addItemDto: AddItemToShoppingCartDto): Promise<ShoppingCart> {
    const ShoppingCart = await this.findOne(id);

    if (ShoppingCart.status !== 'active') {
      throw new BadRequestException('Seules les listes actives peuvent être modifiées');
    }

    // Validate item
    await this.validateItems([addItemDto]);

    // Check if item already exists
    const existingItem = await this.listeAchatItemRepository.findOne({
      where: {
        listeAchatId: id,
        articleId: addItemDto.productId,
        supplierId: addItemDto.supplierId
      }
    });

    if (existingItem) {
      // Update existing item quantity
      existingItem.quantite = addItemDto.quantity || existingItem.quantite;
      if (addItemDto.desiredDeliveryDate) {
        existingItem.dateSouhaitee_livraison = new Date(addItemDto.desiredDeliveryDate);
      }
      await this.listeAchatItemRepository.save(existingItem);
    } else {
      // Create new item
      const newItem = this.listeAchatItemRepository.create({
        listeAchatId: id,
        articleId: addItemDto.productId,
        supplierId: addItemDto.supplierId,
        quantite: addItemDto.quantity || 1,
        dateSouhaitee_livraison: addItemDto.desiredDeliveryDate ? new Date(addItemDto.desiredDeliveryDate) : undefined
      });
      await this.listeAchatItemRepository.save(newItem);
    }

    return this.findOne(id);
  }

  async removeItem(id: string, itemId: string): Promise<ShoppingCart> {
    const ShoppingCart = await this.findOne(id);

    if (ShoppingCart.status !== 'active') {
      throw new BadRequestException('Seules les listes actives peuvent être modifiées');
    }

    const item = await this.listeAchatItemRepository.findOne({
      where: { id: itemId, listeAchatId: id }
    });

    if (!item) {
      throw new NotFoundException('Product non trouvé dans la liste');
    }

    await this.listeAchatItemRepository.remove(item);

    return this.findOne(id);
  }

  async validateAndConvertToOrders(id: string, validateDto: ValidateShoppingCartDto): Promise<Order[]> {
    const ShoppingCart = await this.findOne(id);

    if (ShoppingCart.status !== 'active') {
      throw new BadRequestException('Seule une liste active peut être validée');
    }

    if (!ShoppingCart.items || ShoppingCart.items.length === 0) {
      throw new BadRequestException('La liste d\'achat est vide');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Group items by supplier
      const itemsBySupplier = new Map<string, typeof ShoppingCart.items>();
      
      ShoppingCart.items.forEach(item => {
        const supplierId = item.supplierId;
        if (!itemsBySupplier.has(supplierId)) {
          itemsBySupplier.set(supplierId, []);
        }
        itemsBySupplier.get(supplierId)!.push(item);
      });

      const createdorders: Order[] = [];

      // Create one order per supplier
      for (const [supplierId, items] of itemsBySupplier) {
        const numeroCommande = await this.generateNumeroCommande();
        
        // Create order
        const order = queryRunner.manager.create(Order, {
          orderNumber: numeroCommande,
          stationId: ShoppingCart.stationId,
          supplierId,
          status: OrderStatus.ENREGISTREE,
          totalAmountExcludingTax: 0, // Will be calculated later
          createdById: ShoppingCart.createdById,
        });

        const savedCommande = await queryRunner.manager.save(order);

        // Create order articles
        const commandeArticles = items.map(item => 
          queryRunner.manager.create(OrderProduct, {
            orderId: savedCommande.id,
            productId: item.articleId,
            orderedQuantity: item.quantite,
            // Note: OrderProduct may need additional fields like productSupplierId
          })
        );

        await queryRunner.manager.save(OrderProduct, commandeArticles);
        createdorders.push(savedCommande);
      }

      // Archive the shopping list
      ShoppingCart.status = 'archived';
      await queryRunner.manager.save(ShoppingCart);

      await queryRunner.commitTransaction();

      return createdorders;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string): Promise<void> {
    const ShoppingCart = await this.findOne(id);

    if (ShoppingCart.status !== 'active') {
      throw new BadRequestException('Seules les listes actives peuvent être supprimées');
    }

    await this.listeAchatRepository.remove(ShoppingCart);
  }

  // Utility methods
  private async validateItems(items: any[]) {
    for (const item of items) {
      // Validate Product exists
      const Product = await this.articleRepository.findOne({
        where: { id: item.articleId }
      });
      if (!Product) {
        throw new BadRequestException(`Product ${item.articleId} non trouvé`);
      }

      // Validate supplier exists
      const Supplier = await this.fournisseurRepository.findOne({
        where: { id: item.supplierId }
      });
      if (!Supplier) {
        throw new BadRequestException(`Supplier ${item.fournisseurId} non trouvé`);
      }

      // Validate quantity
      if (item.quantite && item.quantite <= 0) {
        throw new BadRequestException('La quantité doit être positive');
      }
    }
  }

  private async generateNumeroCommande(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.commandeRepository.count({
      where: {
        orderNumber: Repository.prototype.createQueryBuilder()
          .select()
          .where('numeroCommande LIKE :pattern', { pattern: `CMD-${year}-%` })
      } as any
    });
    return `CMD-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }

  // Analytics
  async getListeAchatAnalytics(stationId?: string) {
    const queryBuilder = this.listeAchatRepository
      .createQueryBuilder('liste')
      .leftJoinAndSelect('liste.items', 'items');

    if (stationId) {
      queryBuilder.where('liste.stationId = :stationId', { stationId });
    }

    const listes = await queryBuilder.getMany();

    const totalListes = listes.length;
    const activeListes = listes.filter(l => l.status === 'active').length;
    const archivedListes = listes.filter(l => l.status === 'archived').length;
    const totalItems = listes.reduce((sum, liste) => sum + liste.items.length, 0);

    return {
      totalListes,
      activeListes,
      archivedListes,
      totalItems,
      averageItemsPerListe: totalListes > 0 ? Math.round(totalItems / totalListes) : 0,
    };
  }
}