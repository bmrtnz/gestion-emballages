import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { ListeAchat } from './entities/liste-achat.entity';
import { ListeAchatItem } from './entities/liste-achat-item.entity';
import { CreateListeAchatDto } from './dto/create-liste-achat.dto';
import { UpdateListeAchatDto, AddItemToListeDto, ValidateListeAchatDto } from './dto/update-liste-achat.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationService } from '@common/services/pagination.service';

// Import related entities for validation
import { Article } from '@modules/articles/entities/article.entity';
import { Fournisseur } from '@modules/fournisseurs/entities/fournisseur.entity';
import { Station } from '@modules/stations/entities/station.entity';
import { Commande } from '@modules/commandes/entities/commande.entity';
import { CommandeArticle } from '@modules/commandes/entities/commande-article.entity';
import { OrderStatus } from '@common/enums/order-status.enum';

@Injectable()
export class ListesAchatService {
  constructor(
    @InjectRepository(ListeAchat)
    private listeAchatRepository: Repository<ListeAchat>,
    @InjectRepository(ListeAchatItem)
    private listeAchatItemRepository: Repository<ListeAchatItem>,
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(Fournisseur)
    private fournisseurRepository: Repository<Fournisseur>,
    @InjectRepository(Station)
    private stationRepository: Repository<Station>,
    @InjectRepository(Commande)
    private commandeRepository: Repository<Commande>,
    @InjectRepository(CommandeArticle)
    private commandeArticleRepository: Repository<CommandeArticle>,
    private dataSource: DataSource,
    private paginationService: PaginationService,
  ) {}

  async create(createListeAchatDto: CreateListeAchatDto, createdById?: string): Promise<ListeAchat> {
    // Verify station exists
    const station = await this.stationRepository.findOne({
      where: { id: createListeAchatDto.stationId }
    });

    if (!station) {
      throw new NotFoundException('Station non trouvée');
    }

    // Check if station already has an active shopping list
    const existingListe = await this.listeAchatRepository.findOne({
      where: { 
        stationId: createListeAchatDto.stationId,
        statut: 'active'
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
      const listeAchat = queryRunner.manager.create(ListeAchat, {
        ...createListeAchatDto,
        createdById,
      });

      const savedListeAchat = await queryRunner.manager.save(ListeAchat, listeAchat);

      // Create items if provided
      if (createListeAchatDto.items && createListeAchatDto.items.length > 0) {
        await this.validateItems(createListeAchatDto.items);

        const items = createListeAchatDto.items.map(itemDto => 
          queryRunner.manager.create(ListeAchatItem, {
            ...itemDto,
            listeAchatId: savedListeAchat.id,
            dateSouhaitee_livraison: itemDto.dateSouhaitee_livraison ? new Date(itemDto.dateSouhaitee_livraison) : undefined
          })
        );

        await queryRunner.manager.save(ListeAchatItem, items);
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
      .leftJoinAndSelect('items.article', 'article')
      .leftJoinAndSelect('items.fournisseur', 'fournisseur');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(station.nom ILIKE :search OR station.ville ILIKE :search)',
        { search: `%${paginationDto.search}%` }
      );
    }

    // Add status filter
    if (paginationDto.status === 'active') {
      queryBuilder.andWhere('liste.statut = :status', { status: 'active' });
    } else if (paginationDto.status === 'inactive') {
      queryBuilder.andWhere('liste.statut != :status', { status: 'active' });
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

  async findOne(id: string): Promise<ListeAchat> {
    const listeAchat = await this.listeAchatRepository.findOne({
      where: { id },
      relations: [
        'station',
        'createdBy',
        'items',
        'items.article',
        'items.fournisseur'
      ]
    });

    if (!listeAchat) {
      throw new NotFoundException('Liste d\'achat non trouvée');
    }

    return listeAchat;
  }

  async findActiveByStation(stationId: string): Promise<ListeAchat | null> {
    return this.listeAchatRepository.findOne({
      where: { 
        stationId,
        statut: 'active'
      },
      relations: [
        'station',
        'createdBy',
        'items',
        'items.article',
        'items.fournisseur'
      ]
    });
  }

  async update(id: string, updateListeAchatDto: UpdateListeAchatDto): Promise<ListeAchat> {
    const listeAchat = await this.findOne(id);

    // Only allow updates for active lists
    if (listeAchat.statut !== 'active') {
      throw new BadRequestException('Seules les listes actives peuvent être modifiées');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update list properties
      Object.assign(listeAchat, updateListeAchatDto);
      await queryRunner.manager.save(ListeAchat, listeAchat);

      // Update items if provided
      if (updateListeAchatDto.items) {
        await this.validateItems(updateListeAchatDto.items);

        // Delete existing items
        await queryRunner.manager.delete(ListeAchatItem, { 
          listeAchatId: id 
        });

        // Create new items
        const items = updateListeAchatDto.items.map(itemDto => 
          queryRunner.manager.create(ListeAchatItem, {
            ...itemDto,
            listeAchatId: id,
            dateSouhaitee_livraison: itemDto.dateSouhaitee_livraison ? new Date(itemDto.dateSouhaitee_livraison) : undefined
          })
        );

        await queryRunner.manager.save(ListeAchatItem, items);
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

  async addItem(id: string, addItemDto: AddItemToListeDto): Promise<ListeAchat> {
    const listeAchat = await this.findOne(id);

    if (listeAchat.statut !== 'active') {
      throw new BadRequestException('Seules les listes actives peuvent être modifiées');
    }

    // Validate item
    await this.validateItems([addItemDto]);

    // Check if item already exists
    const existingItem = await this.listeAchatItemRepository.findOne({
      where: {
        listeAchatId: id,
        articleId: addItemDto.articleId,
        fournisseurId: addItemDto.fournisseurId
      }
    });

    if (existingItem) {
      // Update existing item quantity
      existingItem.quantite = addItemDto.quantite || existingItem.quantite;
      if (addItemDto.dateSouhaitee_livraison) {
        existingItem.dateSouhaitee_livraison = new Date(addItemDto.dateSouhaitee_livraison);
      }
      await this.listeAchatItemRepository.save(existingItem);
    } else {
      // Create new item
      const newItem = this.listeAchatItemRepository.create({
        ...addItemDto,
        listeAchatId: id,
        quantite: addItemDto.quantite || 1,
        dateSouhaitee_livraison: addItemDto.dateSouhaitee_livraison ? new Date(addItemDto.dateSouhaitee_livraison) : undefined
      });
      await this.listeAchatItemRepository.save(newItem);
    }

    return this.findOne(id);
  }

  async removeItem(id: string, itemId: string): Promise<ListeAchat> {
    const listeAchat = await this.findOne(id);

    if (listeAchat.statut !== 'active') {
      throw new BadRequestException('Seules les listes actives peuvent être modifiées');
    }

    const item = await this.listeAchatItemRepository.findOne({
      where: { id: itemId, listeAchatId: id }
    });

    if (!item) {
      throw new NotFoundException('Article non trouvé dans la liste');
    }

    await this.listeAchatItemRepository.remove(item);

    return this.findOne(id);
  }

  async validateAndConvertToOrders(id: string, validateDto: ValidateListeAchatDto): Promise<Commande[]> {
    const listeAchat = await this.findOne(id);

    if (listeAchat.statut !== 'active') {
      throw new BadRequestException('Seule une liste active peut être validée');
    }

    if (!listeAchat.items || listeAchat.items.length === 0) {
      throw new BadRequestException('La liste d\'achat est vide');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Group items by supplier
      const itemsBySupplier = new Map<string, typeof listeAchat.items>();
      
      listeAchat.items.forEach(item => {
        const fournisseurId = item.fournisseurId;
        if (!itemsBySupplier.has(fournisseurId)) {
          itemsBySupplier.set(fournisseurId, []);
        }
        itemsBySupplier.get(fournisseurId)!.push(item);
      });

      const createdCommandes: Commande[] = [];

      // Create one order per supplier
      for (const [fournisseurId, items] of itemsBySupplier) {
        const numeroCommande = await this.generateNumeroCommande();
        
        // Create order
        const commande = queryRunner.manager.create(Commande, {
          numeroCommande,
          stationId: listeAchat.stationId,
          fournisseurId,
          statut: OrderStatus.ENREGISTREE,
          montantTotal: 0, // Will be calculated later
          createdById: listeAchat.createdById,
        });

        const savedCommande = await queryRunner.manager.save(Commande, commande);

        // Create order articles
        const commandeArticles = items.map(item => 
          queryRunner.manager.create(CommandeArticle, {
            commandeId: savedCommande.id,
            articleId: item.articleId,
            quantiteCommandee: item.quantite,
            delaiApprovisionnement: item.dateSouhaitee_livraison || undefined,
          })
        );

        await queryRunner.manager.save(CommandeArticle, commandeArticles);
        createdCommandes.push(savedCommande);
      }

      // Archive the shopping list
      listeAchat.statut = 'archived';
      await queryRunner.manager.save(ListeAchat, listeAchat);

      await queryRunner.commitTransaction();

      return createdCommandes;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string): Promise<void> {
    const listeAchat = await this.findOne(id);

    if (listeAchat.statut !== 'active') {
      throw new BadRequestException('Seules les listes actives peuvent être supprimées');
    }

    await this.listeAchatRepository.remove(listeAchat);
  }

  // Utility methods
  private async validateItems(items: any[]) {
    for (const item of items) {
      // Validate article exists
      const article = await this.articleRepository.findOne({
        where: { id: item.articleId }
      });
      if (!article) {
        throw new BadRequestException(`Article ${item.articleId} non trouvé`);
      }

      // Validate supplier exists
      const fournisseur = await this.fournisseurRepository.findOne({
        where: { id: item.fournisseurId }
      });
      if (!fournisseur) {
        throw new BadRequestException(`Fournisseur ${item.fournisseurId} non trouvé`);
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
        numeroCommande: Repository.prototype.createQueryBuilder()
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
    const activeListes = listes.filter(l => l.statut === 'active').length;
    const archivedListes = listes.filter(l => l.statut === 'archived').length;
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