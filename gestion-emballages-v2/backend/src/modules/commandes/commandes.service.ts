import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';

import { Commande } from './entities/commande.entity';
import { CommandeGlobale } from './entities/commande-globale.entity';
import { CommandeArticle } from './entities/commande-article.entity';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { UpdateCommandeDto } from './dto/update-commande.dto';
import { CreateCommandeGlobaleDto } from './dto/create-commande-globale.dto';
import { UpdateCommandeGlobaleDto } from './dto/update-commande-globale.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationService } from '@common/services/pagination.service';
import { OrderStatus } from '@common/enums/order-status.enum';

@Injectable()
export class CommandesService {
  constructor(
    @InjectRepository(Commande)
    private commandeRepository: Repository<Commande>,
    @InjectRepository(CommandeGlobale)
    private commandeGlobaleRepository: Repository<CommandeGlobale>,
    @InjectRepository(CommandeArticle)
    private commandeArticleRepository: Repository<CommandeArticle>,
    private dataSource: DataSource,
    private paginationService: PaginationService,
  ) {}

  // Commandes individuelles
  async createCommande(createCommandeDto: CreateCommandeDto, createdById?: string): Promise<Commande> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate unique order number
      const numeroCommande = await this.generateNumeroCommande();

      // Calculate total amount
      const montantTotalHt = createCommandeDto.commandeArticles.reduce(
        (total, article) => total + (article.quantiteCommandee * article.prixUnitaire),
        0
      );

      // Create commande
      const commande = queryRunner.manager.create(Commande, {
        ...createCommandeDto,
        numeroCommande,
        montantTotalHt,
        createdById,
        dateLivraisonPrevue: createCommandeDto.dateLivraisonPrevue 
          ? new Date(createCommandeDto.dateLivraisonPrevue) 
          : null,
      });

      const savedCommande = await queryRunner.manager.save(Commande, commande);

      // Create commande articles
      const commandeArticles = createCommandeDto.commandeArticles.map(articleDto => 
        queryRunner.manager.create(CommandeArticle, {
          ...articleDto,
          commandeId: savedCommande.id,
          dateSouhaitee_livraison: articleDto.dateSouhaitee_livraison 
            ? new Date(articleDto.dateSouhaitee_livraison) 
            : null,
        })
      );

      await queryRunner.manager.save(CommandeArticle, commandeArticles);

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
      limit: paginationDto.limit || 20,
      sortBy: paginationDto.sortBy || 'createdAt',
      sortOrder: paginationDto.sortOrder || 'DESC'
    });

    const queryBuilder = this.commandeRepository
      .createQueryBuilder('commande')
      .leftJoinAndSelect('commande.station', 'station')
      .leftJoinAndSelect('commande.fournisseur', 'fournisseur')
      .leftJoinAndSelect('commande.commandeGlobale', 'commandeGlobale')
      .leftJoinAndSelect('commande.commandeArticles', 'commandeArticles')
      .leftJoinAndSelect('commandeArticles.article', 'article')
      .leftJoinAndSelect('commandeArticles.articleFournisseur', 'articleFournisseur');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(commande.numeroCommande ILIKE :search OR station.nom ILIKE :search OR fournisseur.nom ILIKE :search)',
        { search: `%${paginationDto.search}%` }
      );
    }

    // Add status filter
    if (paginationDto.status === 'active') {
      queryBuilder.andWhere('commande.statut NOT IN (:...inactiveStatuses)', { 
        inactiveStatuses: [OrderStatus.ARCHIVEE] 
      });
    } else if (paginationDto.status === 'inactive') {
      queryBuilder.andWhere('commande.statut = :archivedStatus', { 
        archivedStatus: OrderStatus.ARCHIVEE 
      });
    }

    // Add role-based filtering
    if (paginationDto['stationId']) {
      queryBuilder.andWhere('commande.stationId = :stationId', { 
        stationId: paginationDto['stationId'] 
      });
    }

    if (paginationDto['fournisseurId']) {
      queryBuilder.andWhere('commande.fournisseurId = :fournisseurId', { 
        fournisseurId: paginationDto['fournisseurId'] 
      });
    }

    // Add statut filter
    if (paginationDto['statut']) {
      queryBuilder.andWhere('commande.statut = :statut', { 
        statut: paginationDto['statut'] 
      });
    }

    // Add sorting and pagination
    queryBuilder
      .orderBy(`commande.${paginationOptions.sortBy}`, paginationOptions.sortOrder)
      .skip(this.paginationService.getSkip(paginationOptions.page, paginationOptions.limit))
      .take(paginationOptions.limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return this.paginationService.createPaginatedResponse(data, total, paginationOptions);
  }

  async findOneCommande(id: string): Promise<Commande> {
    const commande = await this.commandeRepository.findOne({
      where: { id },
      relations: [
        'station',
        'fournisseur',
        'commandeGlobale',
        'commandeArticles',
        'commandeArticles.article',
        'commandeArticles.articleFournisseur',
        'commandeArticles.articleFournisseur.fournisseur',
        'createdBy'
      ]
    });

    if (!commande) {
      throw new NotFoundException('Commande non trouvée');
    }

    return commande;
  }

  async updateCommande(id: string, updateCommandeDto: UpdateCommandeDto): Promise<Commande> {
    const commande = await this.findOneCommande(id);

    // Update dates if provided
    if (updateCommandeDto.dateLivraisonPrevue) {
      updateCommandeDto.dateLivraisonPrevue = new Date(updateCommandeDto.dateLivraisonPrevue) as any;
    }
    if (updateCommandeDto.dateLivraisonReelle) {
      updateCommandeDto.dateLivraisonReelle = new Date(updateCommandeDto.dateLivraisonReelle) as any;
    }

    Object.assign(commande, updateCommandeDto);
    return this.commandeRepository.save(commande);
  }

  async updateCommandeStatus(id: string, statut: OrderStatus): Promise<Commande> {
    const commande = await this.findOneCommande(id);
    
    // Validate status transition
    this.validateStatusTransition(commande.statut, statut);

    commande.statut = statut;
    
    // Set delivery date when received
    if (statut === OrderStatus.RECEPTIONNEE && !commande.dateLivraisonReelle) {
      commande.dateLivraisonReelle = new Date();
    }

    return this.commandeRepository.save(commande);
  }

  async deleteCommande(id: string): Promise<void> {
    const commande = await this.findOneCommande(id);
    
    if (commande.statut !== OrderStatus.ENREGISTREE) {
      throw new BadRequestException('Seules les commandes enregistrées peuvent être supprimées');
    }

    await this.commandeRepository.remove(commande);
  }

  // Commandes globales
  async createCommandeGlobale(createCommandeGlobaleDto: CreateCommandeGlobaleDto, createdById?: string): Promise<CommandeGlobale> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate unique reference
      const referenceGlobale = await this.generateReferenceGlobale();

      // Create commande globale
      const commandeGlobale = queryRunner.manager.create(CommandeGlobale, {
        referenceGlobale,
        stationId: createCommandeGlobaleDto.stationId,
        statutGeneral: createCommandeGlobaleDto.statutGeneral || OrderStatus.ENREGISTREE,
        montantTotalHt: 0,
        createdById,
      });

      const savedCommandeGlobale = await queryRunner.manager.save(CommandeGlobale, commandeGlobale);

      // Create individual commandes
      let totalAmount = 0;
      for (const commandeDto of createCommandeGlobaleDto.commandes) {
        const commandeAmount = commandeDto.commandeArticles.reduce(
          (total, article) => total + (article.quantiteCommandee * article.prixUnitaire),
          0
        );
        totalAmount += commandeAmount;

        const numeroCommande = await this.generateNumeroCommande();
        
        const commande = queryRunner.manager.create(Commande, {
          ...commandeDto,
          stationId: createCommandeGlobaleDto.stationId,
          commandeGlobaleId: savedCommandeGlobale.id,
          numeroCommande,
          montantTotalHt: commandeAmount,
          createdById,
          dateLivraisonPrevue: commandeDto.dateLivraisonPrevue 
            ? new Date(commandeDto.dateLivraisonPrevue) 
            : null,
        });

        const savedCommande = await queryRunner.manager.save(Commande, commande);

        // Create commande articles
        const commandeArticles = commandeDto.commandeArticles.map(articleDto => 
          queryRunner.manager.create(CommandeArticle, {
            ...articleDto,
            commandeId: savedCommande.id,
            dateSouhaitee_livraison: articleDto.dateSouhaitee_livraison 
              ? new Date(articleDto.dateSouhaitee_livraison) 
              : null,
          })
        );

        await queryRunner.manager.save(CommandeArticle, commandeArticles);
      }

      // Update total amount
      savedCommandeGlobale.montantTotalHt = totalAmount;
      await queryRunner.manager.save(CommandeGlobale, savedCommandeGlobale);

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
      limit: paginationDto.limit || 20,
      sortBy: paginationDto.sortBy || 'createdAt',
      sortOrder: paginationDto.sortOrder || 'DESC'
    });

    const queryBuilder = this.commandeGlobaleRepository
      .createQueryBuilder('commandeGlobale')
      .leftJoinAndSelect('commandeGlobale.station', 'station')
      .leftJoinAndSelect('commandeGlobale.commandes', 'commandes')
      .leftJoinAndSelect('commandes.fournisseur', 'fournisseur');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(commandeGlobale.referenceGlobale ILIKE :search OR station.nom ILIKE :search)',
        { search: `%${paginationDto.search}%` }
      );
    }

    // Add status filter
    if (paginationDto.status === 'active') {
      queryBuilder.andWhere('commandeGlobale.statutGeneral NOT IN (:...inactiveStatuses)', { 
        inactiveStatuses: [OrderStatus.ARCHIVEE] 
      });
    } else if (paginationDto.status === 'inactive') {
      queryBuilder.andWhere('commandeGlobale.statutGeneral = :archivedStatus', { 
        archivedStatus: OrderStatus.ARCHIVEE 
      });
    }

    // Add role-based filtering
    if (paginationDto['stationId']) {
      queryBuilder.andWhere('commandeGlobale.stationId = :stationId', { 
        stationId: paginationDto['stationId'] 
      });
    }

    // Add statut filter
    if (paginationDto['statut']) {
      queryBuilder.andWhere('commandeGlobale.statutGeneral = :statut', { 
        statut: paginationDto['statut'] 
      });
    }

    // Add sorting and pagination
    queryBuilder
      .orderBy(`commandeGlobale.${paginationOptions.sortBy}`, paginationOptions.sortOrder)
      .skip(this.paginationService.getSkip(paginationOptions.page, paginationOptions.limit))
      .take(paginationOptions.limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return this.paginationService.createPaginatedResponse(data, total, paginationOptions);
  }

  async findOneCommandeGlobale(id: string): Promise<CommandeGlobale> {
    const commandeGlobale = await this.commandeGlobaleRepository.findOne({
      where: { id },
      relations: [
        'station',
        'commandes',
        'commandes.fournisseur',
        'commandes.commandeArticles',
        'commandes.commandeArticles.article',
        'commandes.commandeArticles.articleFournisseur',
        'createdBy'
      ]
    });

    if (!commandeGlobale) {
      throw new NotFoundException('Commande globale non trouvée');
    }

    return commandeGlobale;
  }

  async updateCommandeGlobale(id: string, updateCommandeGlobaleDto: UpdateCommandeGlobaleDto): Promise<CommandeGlobale> {
    const commandeGlobale = await this.findOneCommandeGlobale(id);

    Object.assign(commandeGlobale, updateCommandeGlobaleDto);
    return this.commandeGlobaleRepository.save(commandeGlobale);
  }

  async updateCommandeGlobaleStatus(id: string, statutGeneral: OrderStatus): Promise<CommandeGlobale> {
    const commandeGlobale = await this.findOneCommandeGlobale(id);
    
    commandeGlobale.statutGeneral = statutGeneral;
    return this.commandeGlobaleRepository.save(commandeGlobale);
  }

  async deleteCommandeGlobale(id: string): Promise<void> {
    const commandeGlobale = await this.findOneCommandeGlobale(id);
    
    if (commandeGlobale.statutGeneral !== OrderStatus.ENREGISTREE) {
      throw new BadRequestException('Seules les commandes globales enregistrées peuvent être supprimées');
    }

    await this.commandeGlobaleRepository.remove(commandeGlobale);
  }

  // Utility methods
  private async generateNumeroCommande(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.commandeRepository.count({
      where: {
        numeroCommande: Like(`CMD-${year}-%`)
      }
    });
    return `CMD-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }

  private async generateReferenceGlobale(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.commandeGlobaleRepository.count({
      where: {
        referenceGlobale: Like(`CGL-${year}-%`)
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