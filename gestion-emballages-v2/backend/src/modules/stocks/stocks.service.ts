import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { StockStation } from './entities/stock-station.entity';
import { StockFournisseur } from './entities/stock-fournisseur.entity';
import { CreateStockStationDto } from './dto/create-stock-station.dto';
import { UpdateStockStationDto, AdjustStockDto } from './dto/update-stock-station.dto';
import { CreateStockFournisseurDto } from './dto/create-stock-fournisseur.dto';
import { UpdateStockFournisseurDto } from './dto/update-stock-fournisseur.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationService } from '@common/services/pagination.service';

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(StockStation)
    private stockStationRepository: Repository<StockStation>,
    @InjectRepository(StockFournisseur)
    private stockFournisseurRepository: Repository<StockFournisseur>,
    private dataSource: DataSource,
    private paginationService: PaginationService,
  ) {}

  // Station Stock Management
  async createStockStation(createStockStationDto: CreateStockStationDto, updatedById?: string): Promise<StockStation> {
    // Check if stock entry already exists
    const existingStock = await this.stockStationRepository.findOne({
      where: {
        stationId: createStockStationDto.stationId,
        articleId: createStockStationDto.articleId
      }
    });

    if (existingStock) {
      throw new BadRequestException('Un stock existe déjà pour cet article dans cette station');
    }

    const stockStation = this.stockStationRepository.create({
      ...createStockStationDto,
      updatedById,
      derniereMiseAJour: new Date()
    });

    return this.stockStationRepository.save(stockStation);
  }

  async findAllStockStations(paginationDto: PaginationDto) {
    const paginationOptions = this.paginationService.validatePaginationOptions({
      page: paginationDto.page || 1,
      limit: paginationDto.limit || 10,
      sortBy: paginationDto.sortBy || 'derniereMiseAJour',
      sortOrder: paginationDto.sortOrder || 'DESC'
    });

    const queryBuilder = this.stockStationRepository
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.station', 'station')
      .leftJoinAndSelect('stock.article', 'article')
      .leftJoinAndSelect('stock.updatedBy', 'updatedBy');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(station.nom ILIKE :search OR article.designation ILIKE :search OR article.codeArticle ILIKE :search)',
        { search: `%${paginationDto.search}%` }
      );
    }

    // Add station filter for role-based access
    if (paginationDto['stationId']) {
      queryBuilder.andWhere('stock.stationId = :stationId', { 
        stationId: paginationDto['stationId'] 
      });
    }

    // Add article filter
    if (paginationDto['articleId']) {
      queryBuilder.andWhere('stock.articleId = :articleId', { 
        articleId: paginationDto['articleId'] 
      });
    }

    // Add low stock filter
    if (paginationDto['lowStock'] === 'true') {
      queryBuilder.andWhere(
        '(stock.seuilAlerte IS NOT NULL AND stock.quantiteActuelle <= stock.seuilAlerte) OR ' +
        '(stock.seuilCritique IS NOT NULL AND stock.quantiteActuelle <= stock.seuilCritique)'
      );
    }

    // Add critical stock filter
    if (paginationDto['criticalStock'] === 'true') {
      queryBuilder.andWhere(
        'stock.seuilCritique IS NOT NULL AND stock.quantiteActuelle <= stock.seuilCritique'
      );
    }

    // Add sorting and pagination
    queryBuilder
      .orderBy(`stock.${paginationOptions.sortBy}`, paginationOptions.sortOrder)
      .skip(this.paginationService.getSkip(paginationOptions.page, paginationOptions.limit))
      .take(paginationOptions.limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return this.paginationService.createPaginatedResponse(data, total, paginationOptions);
  }

  async findOneStockStation(id: string): Promise<StockStation> {
    const stockStation = await this.stockStationRepository.findOne({
      where: { id },
      relations: ['station', 'article', 'updatedBy']
    });

    if (!stockStation) {
      throw new NotFoundException('Stock station non trouvé');
    }

    return stockStation;
  }

  async findStockByStationAndArticle(stationId: string, articleId: string): Promise<StockStation | null> {
    return this.stockStationRepository.findOne({
      where: { stationId, articleId },
      relations: ['station', 'article', 'updatedBy']
    });
  }

  async updateStockStation(id: string, updateStockStationDto: UpdateStockStationDto, updatedById?: string): Promise<StockStation> {
    const stockStation = await this.findOneStockStation(id);

    Object.assign(stockStation, {
      ...updateStockStationDto,
      updatedById,
      derniereMiseAJour: new Date()
    });

    return this.stockStationRepository.save(stockStation);
  }

  async adjustStockStation(id: string, adjustStockDto: AdjustStockDto, updatedById?: string): Promise<StockStation> {
    const stockStation = await this.findOneStockStation(id);

    const newQuantity = stockStation.quantiteActuelle + adjustStockDto.ajustement;
    
    if (newQuantity < 0) {
      throw new BadRequestException('La quantité ne peut pas être négative');
    }

    stockStation.quantiteActuelle = newQuantity;
    stockStation.updatedById = updatedById;
    stockStation.derniereMiseAJour = new Date();

    return this.stockStationRepository.save(stockStation);
  }

  async deleteStockStation(id: string): Promise<void> {
    const stockStation = await this.findOneStockStation(id);
    await this.stockStationRepository.remove(stockStation);
  }

  // Supplier Stock Management
  async createStockFournisseur(createStockFournisseurDto: CreateStockFournisseurDto): Promise<StockFournisseur> {
    // Check if stock entry already exists
    const existingStock = await this.stockFournisseurRepository.findOne({
      where: {
        fournisseurSiteId: createStockFournisseurDto.fournisseurSiteId,
        articleId: createStockFournisseurDto.articleId
      }
    });

    if (existingStock) {
      throw new BadRequestException('Un stock existe déjà pour cet article chez ce fournisseur');
    }

    const stockFournisseur = this.stockFournisseurRepository.create({
      ...createStockFournisseurDto,
      derniereMiseAJour: new Date()
    });

    return this.stockFournisseurRepository.save(stockFournisseur);
  }

  async findAllStockFournisseurs(paginationDto: PaginationDto) {
    const paginationOptions = this.paginationService.validatePaginationOptions({
      page: paginationDto.page || 1,
      limit: paginationDto.limit || 10,
      sortBy: paginationDto.sortBy || 'derniereMiseAJour',
      sortOrder: paginationDto.sortOrder || 'DESC'
    });

    const queryBuilder = this.stockFournisseurRepository
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.fournisseurSite', 'fournisseurSite')
      .leftJoinAndSelect('fournisseurSite.fournisseur', 'fournisseur')
      .leftJoinAndSelect('stock.article', 'article');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(fournisseur.nom ILIKE :search OR article.designation ILIKE :search OR article.codeArticle ILIKE :search)',
        { search: `%${paginationDto.search}%` }
      );
    }

    // Add fournisseur filter for role-based access
    if (paginationDto['fournisseurId']) {
      queryBuilder.andWhere('fournisseur.id = :fournisseurId', { 
        fournisseurId: paginationDto['fournisseurId'] 
      });
    }

    // Add article filter
    if (paginationDto['articleId']) {
      queryBuilder.andWhere('stock.articleId = :articleId', { 
        articleId: paginationDto['articleId'] 
      });
    }

    // Add available stock filter
    if (paginationDto['availableOnly'] === 'true') {
      queryBuilder.andWhere('stock.quantiteDisponible > 0');
    }

    // Add sorting and pagination
    queryBuilder
      .orderBy(`stock.${paginationOptions.sortBy}`, paginationOptions.sortOrder)
      .skip(this.paginationService.getSkip(paginationOptions.page, paginationOptions.limit))
      .take(paginationOptions.limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return this.paginationService.createPaginatedResponse(data, total, paginationOptions);
  }

  async findOneStockFournisseur(id: string): Promise<StockFournisseur> {
    const stockFournisseur = await this.stockFournisseurRepository.findOne({
      where: { id },
      relations: ['fournisseurSite', 'fournisseurSite.fournisseur', 'article']
    });

    if (!stockFournisseur) {
      throw new NotFoundException('Stock fournisseur non trouvé');
    }

    return stockFournisseur;
  }

  async findStockByFournisseurSiteAndArticle(fournisseurSiteId: string, articleId: string): Promise<StockFournisseur | null> {
    return this.stockFournisseurRepository.findOne({
      where: { fournisseurSiteId, articleId },
      relations: ['fournisseurSite', 'fournisseurSite.fournisseur', 'article']
    });
  }

  async updateStockFournisseur(id: string, updateStockFournisseurDto: UpdateStockFournisseurDto): Promise<StockFournisseur> {
    const stockFournisseur = await this.findOneStockFournisseur(id);

    Object.assign(stockFournisseur, {
      ...updateStockFournisseurDto,
      derniereMiseAJour: new Date()
    });

    return this.stockFournisseurRepository.save(stockFournisseur);
  }

  async deleteStockFournisseur(id: string): Promise<void> {
    const stockFournisseur = await this.findOneStockFournisseur(id);
    await this.stockFournisseurRepository.remove(stockFournisseur);
  }

  // Analytics and Reports
  async getStockAnalytics(stationId?: string) {
    const queryBuilder = this.stockStationRepository
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.station', 'station')
      .leftJoinAndSelect('stock.article', 'article');

    if (stationId) {
      queryBuilder.where('stock.stationId = :stationId', { stationId });
    }

    const stocks = await queryBuilder.getMany();

    const totalArticles = stocks.length;
    const lowStockItems = stocks.filter(stock => 
      stock.seuilAlerte && stock.quantiteActuelle <= stock.seuilAlerte
    ).length;
    const criticalStockItems = stocks.filter(stock => 
      stock.seuilCritique && stock.quantiteActuelle <= stock.seuilCritique
    ).length;
    const outOfStockItems = stocks.filter(stock => stock.quantiteActuelle === 0).length;

    const totalQuantity = stocks.reduce((sum, stock) => sum + stock.quantiteActuelle, 0);

    return {
      totalArticles,
      lowStockItems,
      criticalStockItems,
      outOfStockItems,
      totalQuantity,
      stockStatus: {
        normal: totalArticles - lowStockItems,
        lowStock: lowStockItems - criticalStockItems,
        critical: criticalStockItems,
        outOfStock: outOfStockItems
      }
    };
  }

  async getLowStockAlerts(stationId?: string) {
    const queryBuilder = this.stockStationRepository
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.station', 'station')
      .leftJoinAndSelect('stock.article', 'article')
      .where(
        '(stock.seuilAlerte IS NOT NULL AND stock.quantiteActuelle <= stock.seuilAlerte) OR ' +
        '(stock.seuilCritique IS NOT NULL AND stock.quantiteActuelle <= stock.seuilCritique)'
      );

    if (stationId) {
      queryBuilder.andWhere('stock.stationId = :stationId', { stationId });
    }

    return queryBuilder
      .orderBy('stock.quantiteActuelle', 'ASC')
      .getMany();
  }

  async getStockMovements(articleId: string, stationId?: string, days: number = 30) {
    // This would typically involve a separate StockMovement entity
    // For now, return placeholder data structure
    return {
      articleId,
      stationId,
      movements: [],
      period: `${days} days`,
      totalIn: 0,
      totalOut: 0,
      netChange: 0
    };
  }
}