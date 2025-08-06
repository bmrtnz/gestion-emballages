import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';

import { DemandeTransfert } from './entities/demande-transfert.entity';
import { DemandeTransfertArticle } from './entities/demande-transfert-article.entity';
import { CreateDemandeTransfertDto } from './dto/create-demande-transfert.dto';
import { UpdateDemandeTransfertDto, ApproveTransferDto } from './dto/update-demande-transfert.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationService } from '@common/services/pagination.service';
import { TransferStatus } from '@common/enums/transfer-status.enum';

@Injectable()
export class TransfertsService {
  constructor(
    @InjectRepository(DemandeTransfert)
    private demandeTransfertRepository: Repository<DemandeTransfert>,
    @InjectRepository(DemandeTransfertArticle)
    private demandeTransfertArticleRepository: Repository<DemandeTransfertArticle>,
    private dataSource: DataSource,
    private paginationService: PaginationService,
  ) {}

  async createDemandeTransfert(createDemandeTransfertDto: CreateDemandeTransfertDto, createdById?: string): Promise<DemandeTransfert> {
    // Validate that stations are different
    if (createDemandeTransfertDto.stationDemandeuseId === createDemandeTransfertDto.stationSourceId) {
      throw new BadRequestException('La station demandeuse et la station source doivent être différentes');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate unique transfer number
      const numeroDemande = await this.generateNumeroDemande();

      // Calculate total amount (placeholder - would need pricing info)
      const montantTotal = 0; // To be calculated based on pricing

      // Create transfer request
      const demandeTransfert = queryRunner.manager.create(DemandeTransfert, {
        ...createDemandeTransfertDto,
        numeroDemande,
        montantTotal,
        createdById,
      });

      const savedDemandeTransfert = await queryRunner.manager.save(DemandeTransfert, demandeTransfert);

      // Create transfer articles
      const transferArticles = createDemandeTransfertDto.articles.map(articleDto => 
        queryRunner.manager.create(DemandeTransfertArticle, {
          ...articleDto,
          demandeTransfertId: savedDemandeTransfert.id,
        })
      );

      await queryRunner.manager.save(DemandeTransfertArticle, transferArticles);

      await queryRunner.commitTransaction();

      // Return with relations
      return this.findOne(savedDemandeTransfert.id);
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
      limit: paginationDto.limit || 20,
      sortBy: paginationDto.sortBy || 'createdAt',
      sortOrder: paginationDto.sortOrder || 'DESC'
    });

    const queryBuilder = this.demandeTransfertRepository
      .createQueryBuilder('transfert')
      .leftJoinAndSelect('transfert.stationDemandeuse', 'stationDemandeuse')
      .leftJoinAndSelect('transfert.stationSource', 'stationSource')
      .leftJoinAndSelect('transfert.createdBy', 'createdBy')
      .leftJoinAndSelect('transfert.articles', 'articles')
      .leftJoinAndSelect('articles.article', 'article');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(transfert.numeroDemande ILIKE :search OR stationDemandeuse.nom ILIKE :search OR stationSource.nom ILIKE :search)',
        { search: `%${paginationDto.search}%` }
      );
    }

    // Add status filter
    if (paginationDto.status === 'active') {
      queryBuilder.andWhere('transfert.statut NOT IN (:...inactiveStatuses)', { 
        inactiveStatuses: [TransferStatus.ARCHIVEE, TransferStatus.REJETEE] 
      });
    } else if (paginationDto.status === 'inactive') {
      queryBuilder.andWhere('transfert.statut IN (:...inactiveStatuses)', { 
        inactiveStatuses: [TransferStatus.ARCHIVEE, TransferStatus.REJETEE] 
      });
    }

    // Add role-based filtering
    if (paginationDto['stationDemandeuseId']) {
      queryBuilder.andWhere('transfert.stationDemandeuseId = :stationDemandeuseId', { 
        stationDemandeuseId: paginationDto['stationDemandeuseId'] 
      });
    }

    if (paginationDto['stationSourceId']) {
      queryBuilder.andWhere('transfert.stationSourceId = :stationSourceId', { 
        stationSourceId: paginationDto['stationSourceId'] 
      });
    }

    // Add statut filter
    if (paginationDto['statut']) {
      queryBuilder.andWhere('transfert.statut = :statut', { 
        statut: paginationDto['statut'] 
      });
    }

    // Add pending approval filter
    if (paginationDto['pendingApproval'] === 'true') {
      queryBuilder.andWhere('transfert.statut = :pendingStatus', { 
        pendingStatus: TransferStatus.ENREGISTREE 
      });
    }

    // Add sorting and pagination
    queryBuilder
      .orderBy(`transfert.${paginationOptions.sortBy}`, paginationOptions.sortOrder)
      .skip(this.paginationService.getSkip(paginationOptions.page, paginationOptions.limit))
      .take(paginationOptions.limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return this.paginationService.createPaginatedResponse(data, total, paginationOptions);
  }

  async findOne(id: string): Promise<DemandeTransfert> {
    const demandeTransfert = await this.demandeTransfertRepository.findOne({
      where: { id },
      relations: [
        'stationDemandeuse',
        'stationSource',
        'createdBy',
        'articles',
        'articles.article'
      ]
    });

    if (!demandeTransfert) {
      throw new NotFoundException('Demande de transfert non trouvée');
    }

    return demandeTransfert;
  }

  async update(id: string, updateDemandeTransfertDto: UpdateDemandeTransfertDto): Promise<DemandeTransfert> {
    const demandeTransfert = await this.findOne(id);

    // Only allow updates for certain statuses
    if (demandeTransfert.statut !== TransferStatus.ENREGISTREE) {
      throw new BadRequestException('Seules les demandes enregistrées peuvent être modifiées');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update transfer request
      Object.assign(demandeTransfert, updateDemandeTransfertDto);
      await queryRunner.manager.save(DemandeTransfert, demandeTransfert);

      // Update articles if provided
      if (updateDemandeTransfertDto.articles) {
        // Delete existing articles
        await queryRunner.manager.delete(DemandeTransfertArticle, { 
          demandeTransfertId: id 
        });

        // Create new articles
        const transferArticles = updateDemandeTransfertDto.articles.map(articleDto => 
          queryRunner.manager.create(DemandeTransfertArticle, {
            ...articleDto,
            demandeTransfertId: id,
          })
        );

        await queryRunner.manager.save(DemandeTransfertArticle, transferArticles);
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

  async updateStatus(id: string, statut: TransferStatus): Promise<DemandeTransfert> {
    const demandeTransfert = await this.findOne(id);
    
    // Validate status transition
    this.validateStatusTransition(demandeTransfert.statut, statut);

    demandeTransfert.statut = statut;
    
    return this.demandeTransfertRepository.save(demandeTransfert);
  }

  async approveTransfer(id: string, approveTransferDto: ApproveTransferDto): Promise<DemandeTransfert> {
    const demandeTransfert = await this.findOne(id);
    
    if (demandeTransfert.statut !== TransferStatus.ENREGISTREE) {
      throw new BadRequestException('Seules les demandes enregistrées peuvent être approuvées');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update transfer status
      demandeTransfert.statut = TransferStatus.CONFIRMEE;
      await queryRunner.manager.save(DemandeTransfert, demandeTransfert);

      // Update articles with approved quantities
      for (const articleDto of approveTransferDto.articles) {
        const existingArticle = demandeTransfert.articles.find(a => a.articleId === articleDto.articleId);
        if (existingArticle) {
          existingArticle.quantiteAccordee = articleDto.quantiteAccordee || 0;
          await queryRunner.manager.save(DemandeTransfertArticle, existingArticle);
        }
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

  async rejectTransfer(id: string, reason?: string): Promise<DemandeTransfert> {
    const demandeTransfert = await this.findOne(id);
    
    if (demandeTransfert.statut !== TransferStatus.ENREGISTREE) {
      throw new BadRequestException('Seules les demandes enregistrées peuvent être rejetées');
    }

    demandeTransfert.statut = TransferStatus.REJETEE;
    
    return this.demandeTransfertRepository.save(demandeTransfert);
  }

  async delete(id: string): Promise<void> {
    const demandeTransfert = await this.findOne(id);
    
    if (demandeTransfert.statut !== TransferStatus.ENREGISTREE) {
      throw new BadRequestException('Seules les demandes enregistrées peuvent être supprimées');
    }

    await this.demandeTransfertRepository.remove(demandeTransfert);
  }

  // Analytics and Reports
  async getTransferAnalytics(stationId?: string) {
    const queryBuilder = this.demandeTransfertRepository
      .createQueryBuilder('transfert');

    if (stationId) {
      queryBuilder.where(
        'transfert.stationDemandeuseId = :stationId OR transfert.stationSourceId = :stationId',
        { stationId }
      );
    }

    const transfers = await queryBuilder.getMany();

    const totalTransfers = transfers.length;
    const pendingTransfers = transfers.filter(t => t.statut === TransferStatus.ENREGISTREE).length;
    const approvedTransfers = transfers.filter(t => t.statut === TransferStatus.CONFIRMEE).length;
    const completedTransfers = transfers.filter(t => t.statut === TransferStatus.CLOTUREE).length;
    const rejectedTransfers = transfers.filter(t => t.statut === TransferStatus.REJETEE).length;

    return {
      totalTransfers,
      pendingTransfers,
      approvedTransfers,
      completedTransfers,
      rejectedTransfers,
      statusDistribution: {
        [TransferStatus.ENREGISTREE]: pendingTransfers,
        [TransferStatus.CONFIRMEE]: approvedTransfers,
        [TransferStatus.CLOTUREE]: completedTransfers,
        [TransferStatus.REJETEE]: rejectedTransfers,
      }
    };
  }

  async getPendingApprovals(stationId?: string) {
    const queryBuilder = this.demandeTransfertRepository
      .createQueryBuilder('transfert')
      .leftJoinAndSelect('transfert.stationDemandeuse', 'stationDemandeuse')
      .leftJoinAndSelect('transfert.stationSource', 'stationSource')
      .leftJoinAndSelect('transfert.articles', 'articles')
      .leftJoinAndSelect('articles.article', 'article')
      .where('transfert.statut = :status', { status: TransferStatus.ENREGISTREE });

    if (stationId) {
      queryBuilder.andWhere('transfert.stationSourceId = :stationId', { stationId });
    }

    return queryBuilder
      .orderBy('transfert.createdAt', 'ASC')
      .getMany();
  }

  // Utility methods
  private async generateNumeroDemande(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.demandeTransfertRepository.count({
      where: {
        numeroDemande: Like(`TRF-${year}-%`)
      }
    });
    return `TRF-${year}-${(count + 1).toString().padStart(6, '0')}`;
  }

  private validateStatusTransition(currentStatus: TransferStatus, newStatus: TransferStatus): void {
    const validTransitions = {
      [TransferStatus.ENREGISTREE]: [TransferStatus.CONFIRMEE, TransferStatus.REJETEE, TransferStatus.ARCHIVEE],
      [TransferStatus.CONFIRMEE]: [TransferStatus.TRAITEE_LOGISTIQUE, TransferStatus.ARCHIVEE],
      [TransferStatus.TRAITEE_LOGISTIQUE]: [TransferStatus.EXPEDIEE, TransferStatus.ARCHIVEE],
      [TransferStatus.EXPEDIEE]: [TransferStatus.RECEPTIONNEE, TransferStatus.ARCHIVEE],
      [TransferStatus.RECEPTIONNEE]: [TransferStatus.CLOTUREE, TransferStatus.ARCHIVEE],
      [TransferStatus.CLOTUREE]: [TransferStatus.TRAITEE_COMPTABILITE, TransferStatus.ARCHIVEE],
      [TransferStatus.TRAITEE_COMPTABILITE]: [TransferStatus.ARCHIVEE],
      [TransferStatus.REJETEE]: [],
      [TransferStatus.ARCHIVEE]: []
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Transition de statut invalide: ${currentStatus} vers ${newStatus}`
      );
    }
  }
}