import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';

import { TransferRequest } from './entities/transfer-request.entity';
import { TransferRequestProduct } from './entities/transfer-request-product.entity';
import { CreateTransferRequestDto } from './dto/create-transfer-request.dto';
import { UpdateTransferRequestDto, ApproveTransferDto } from './dto/update-transfer-request.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationService } from '@common/services/pagination.service';
import { TransferStatus } from '@common/enums/transfer-status.enum';

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(TransferRequest)
    private demandeTransfertRepository: Repository<TransferRequest>,
    @InjectRepository(TransferRequestProduct)
    private demandeTransfertArticleRepository: Repository<TransferRequestProduct>,
    private dataSource: DataSource,
    private paginationService: PaginationService,
  ) {}

  async createDemandeTransfert(createTransferRequestDto: CreateTransferRequestDto, createdById?: string): Promise<TransferRequest> {
    // Validate that stations are different
    if (createTransferRequestDto.requestingStationId === createTransferRequestDto.sourceStationId) {
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
      const transferRequest = queryRunner.manager.create(TransferRequest, {
        ...createTransferRequestDto,
        numeroDemande,
        montantTotal,
        createdById,
      });

      const savedDemandeTransfert = await queryRunner.manager.save(transferRequest);

      // Create transfer articles
      const transferArticles = createTransferRequestDto.articles.map(articleDto => 
        queryRunner.manager.create(TransferRequestProduct, {
          ...articleDto,
          transferRequestId: savedDemandeTransfert.id,
        })
      );

      await queryRunner.manager.save(transferArticles);

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
      limit: paginationDto.limit || 10,
      sortBy: paginationDto.sortBy || 'createdAt',
      sortOrder: paginationDto.sortOrder || 'DESC'
    });

    const queryBuilder = this.demandeTransfertRepository
      .createQueryBuilder('transfert')
      .leftJoinAndSelect('transfert.requestingStationId', 'requestingStationId')
      .leftJoinAndSelect('transfert.sourceStationId', 'sourceStationId')
      .leftJoinAndSelect('transfert.createdBy', 'createdBy')
      .leftJoinAndSelect('transfert.articles', 'articles')
      .leftJoinAndSelect('articles.Product', 'Product');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(transfert.numeroDemande ILIKE :search OR requestingStationId.name ILIKE :search OR sourceStationId.name ILIKE :search)',
        { search: `%${paginationDto.search}%` }
      );
    }

    // Add status filter
    if (paginationDto.status === 'active') {
      queryBuilder.andWhere('transfert.status NOT IN (:...inactiveStatuses)', { 
        inactiveStatuses: [TransferStatus.ARCHIVEE, TransferStatus.REJETEE] 
      });
    } else if (paginationDto.status === 'inactive') {
      queryBuilder.andWhere('transfert.status IN (:...inactiveStatuses)', { 
        inactiveStatuses: [TransferStatus.ARCHIVEE, TransferStatus.REJETEE] 
      });
    }

    // Add role-based filtering
    if (paginationDto['requestingStationIdId']) {
      queryBuilder.andWhere('transfert.requestingStationIdId = :requestingStationIdId', { 
        requestingStationIdId: paginationDto['requestingStationIdId'] 
      });
    }

    if (paginationDto['sourceStationIdId']) {
      queryBuilder.andWhere('transfert.sourceStationIdId = :sourceStationIdId', { 
        sourceStationIdId: paginationDto['sourceStationIdId'] 
      });
    }

    // Add statut filter
    if (paginationDto['statut']) {
      queryBuilder.andWhere('transfert.status = :statut', { 
        status: paginationDto['statut'] 
      });
    }

    // Add pending approval filter
    if (paginationDto['pendingApproval'] === 'true') {
      queryBuilder.andWhere('transfert.status = :pendingStatus', { 
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

  async findOne(id: string): Promise<TransferRequest> {
    const TransferRequest = await this.demandeTransfertRepository.findOne({
      where: { id },
      relations: [
        'requestingStationId',
        'sourceStationId',
        'createdBy',
        'articles',
        'articles.Product'
      ]
    });

    if (!TransferRequest) {
      throw new NotFoundException('Demande de transfert non trouvée');
    }

    return TransferRequest;
  }

  async update(id: string, updateTransferRequestDto: UpdateTransferRequestDto): Promise<TransferRequest> {
    const transferRequest = await this.findOne(id);

    // Only allow updates for certain statuses
    if (transferRequest.status !== TransferStatus.ENREGISTREE) {
      throw new BadRequestException('Seules les demandes enregistrées peuvent être modifiées');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update transfer request
      Object.assign(transferRequest, updateTransferRequestDto);
      await queryRunner.manager.save(transferRequest);

      // Update articles if provided
      if (updateTransferRequestDto.products) {
        // Delete existing articles
        await queryRunner.manager.delete(TransferRequestProduct, { 
          transferRequestId: id 
        });

        // Create new articles
        const transferArticles = updateTransferRequestDto.products.map(productDto => 
          queryRunner.manager.create(TransferRequestProduct, {
            ...productDto,
            transferRequestId: id,
          })
        );

        await queryRunner.manager.save(transferArticles);
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

  async updateStatus(id: string, status: TransferStatus): Promise<TransferRequest> {
    const transferRequest = await this.findOne(id);
    
    // Validate status transition
    this.validateStatusTransition(transferRequest.status, status);

    transferRequest.status = status;
    
    return this.demandeTransfertRepository.save(transferRequest);
  }

  async approveTransfer(id: string, approveTransferDto: ApproveTransferDto): Promise<TransferRequest> {
    const transferRequest = await this.findOne(id);
    
    if (transferRequest.status !== TransferStatus.ENREGISTREE) {
      throw new BadRequestException('Seules les demandes enregistrées peuvent être approuvées');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update transfer status
      transferRequest.status = TransferStatus.CONFIRMEE;
      await queryRunner.manager.save(transferRequest);

      // Update articles with approved quantities
      for (const productDto of approveTransferDto.products) {
        const existingProduct = transferRequest.products.find(p => p.productId === productDto.productId);
        if (existingProduct) {
          existingProduct.grantedQuantity = productDto.grantedQuantity || 0;
          await queryRunner.manager.save(existingProduct);
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

  async rejectTransfer(id: string, reason?: string): Promise<TransferRequest> {
    const transferRequest = await this.findOne(id);
    
    if (transferRequest.status !== TransferStatus.ENREGISTREE) {
      throw new BadRequestException('Seules les demandes enregistrées peuvent être rejetées');
    }

    transferRequest.status = TransferStatus.REJETEE;
    
    return this.demandeTransfertRepository.save(transferRequest);
  }

  async delete(id: string): Promise<void> {
    const transferRequest = await this.findOne(id);
    
    if (transferRequest.status !== TransferStatus.ENREGISTREE) {
      throw new BadRequestException('Seules les demandes enregistrées peuvent être supprimées');
    }

    await this.demandeTransfertRepository.remove(transferRequest);
  }

  // Analytics and Reports
  async getTransferAnalytics(stationId?: string) {
    const queryBuilder = this.demandeTransfertRepository
      .createQueryBuilder('transfert');

    if (stationId) {
      queryBuilder.where(
        'transfert.requestingStationIdId = :stationId OR transfert.sourceStationIdId = :stationId',
        { stationId }
      );
    }

    const transfers = await queryBuilder.getMany();

    const totalTransfers = transfers.length;
    const pendingTransfers = transfers.filter(t => t.status === TransferStatus.ENREGISTREE).length;
    const approvedTransfers = transfers.filter(t => t.status === TransferStatus.CONFIRMEE).length;
    const completedTransfers = transfers.filter(t => t.status === TransferStatus.CLOTUREE).length;
    const rejectedTransfers = transfers.filter(t => t.status === TransferStatus.REJETEE).length;

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
      .leftJoinAndSelect('transfert.requestingStationId', 'requestingStationId')
      .leftJoinAndSelect('transfert.sourceStationId', 'sourceStationId')
      .leftJoinAndSelect('transfert.articles', 'articles')
      .leftJoinAndSelect('articles.Product', 'Product')
      .where('transfert.status = :status', { status: TransferStatus.ENREGISTREE });

    if (stationId) {
      queryBuilder.andWhere('transfert.sourceStationIdId = :stationId', { stationId });
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