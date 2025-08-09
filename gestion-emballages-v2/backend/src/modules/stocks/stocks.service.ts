import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { StockStation } from './entities/stock-station.entity';
import { StockSupplier } from './entities/stock-supplier.entity';
import { CreateStockStationDto } from './dto/create-stock-station.dto';
import { UpdateStockStationDto, AdjustStockDto } from './dto/update-stock-station.dto';
import { CreateStockSupplierDto } from './dto/create-stock-supplier.dto';
import { UpdateStockSupplierDto } from './dto/update-stock-supplier.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { PaginationService } from '@common/services/pagination.service';

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(StockStation)
    private stockStationRepository: Repository<StockStation>,
    @InjectRepository(StockSupplier)
    private stockFournisseurRepository: Repository<StockSupplier>,
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
      throw new BadRequestException('Un stock existe déjà pour cet Product dans cette station');
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
      .leftJoinAndSelect('stock.Product', 'Product')
      .leftJoinAndSelect('stock.updatedBy', 'updatedBy');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(station.name ILIKE :search OR Product.designation ILIKE :search OR Product.codeArticle ILIKE :search)',
        { search: `%${paginationDto.search}%` }
      );
    }

    // Add station filter for role-based access
    if (paginationDto['stationId']) {
      queryBuilder.andWhere('stock.stationId = :stationId', { 
        stationId: paginationDto['stationId'] 
      });
    }

    // Add Product filter
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
      relations: ['station', 'Product', 'updatedBy']
    });

    if (!stockStation) {
      throw new NotFoundException('Stock station non trouvé');
    }

    return stockStation;
  }

  async findStockByStationAndArticle(stationId: string, articleId: string): Promise<StockStation | null> {
    return this.stockStationRepository.findOne({
      where: { stationId, articleId },
      relations: ['station', 'Product', 'updatedBy']
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
  async createStockFournisseur(CreateStockSupplierDto: CreateStockSupplierDto): Promise<StockSupplier> {
    // Check if stock entry already exists
    const existingStock = await this.stockFournisseurRepository.findOne({
      where: {
        fournisseurSiteId: CreateStockSupplierDto.fournisseurSiteId,
        articleId: CreateStockSupplierDto.articleId
      }
    });

    if (existingStock) {
      throw new BadRequestException('Un stock existe déjà pour cet Product chez ce Supplier');
    }

    const StockSupplier = this.stockFournisseurRepository.create({
      ...CreateStockSupplierDto,
      derniereMiseAJour: new Date()
    });

    return this.stockFournisseurRepository.save(StockSupplier);
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
      .leftJoinAndSelect('stock.SupplierSite', 'SupplierSite')
      .leftJoinAndSelect('SupplierSite.Supplier', 'Supplier')
      .leftJoinAndSelect('stock.Product', 'Product');

    // Add search functionality
    if (paginationDto.search) {
      queryBuilder.where(
        '(Supplier.name ILIKE :search OR Product.designation ILIKE :search OR Product.codeArticle ILIKE :search)',
        { search: `%${paginationDto.search}%` }
      );
    }

    // Add Supplier filter for role-based access
    if (paginationDto['fournisseurId']) {
      queryBuilder.andWhere('Supplier.id = :fournisseurId', { 
        supplierId: paginationDto['fournisseurId'] 
      });
    }

    // Add Product filter
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

  async findOneStockFournisseur(id: string): Promise<StockSupplier> {
    const StockSupplier = await this.stockFournisseurRepository.findOne({
      where: { id },
      relations: ['SupplierSite', 'SupplierSite.Supplier', 'Product']
    });

    if (!StockSupplier) {
      throw new NotFoundException('Stock Supplier non trouvé');
    }

    return StockSupplier;
  }

  async findStockByFournisseurSiteAndArticle(fournisseurSiteId: string, articleId: string): Promise<StockSupplier | null> {
    return this.stockFournisseurRepository.findOne({
      where: { fournisseurSiteId, articleId },
      relations: ['SupplierSite', 'SupplierSite.Supplier', 'Product']
    });
  }

  async updateStockFournisseur(id: string, UpdateStockSupplierDto: UpdateStockSupplierDto): Promise<StockSupplier> {
    const StockSupplier = await this.findOneStockFournisseur(id);

    Object.assign(StockSupplier, {
      ...UpdateStockSupplierDto,
      derniereMiseAJour: new Date()
    });

    return this.stockFournisseurRepository.save(StockSupplier);
  }

  async deleteStockFournisseur(id: string): Promise<void> {
    const StockSupplier = await this.findOneStockFournisseur(id);
    await this.stockFournisseurRepository.remove(StockSupplier);
  }

  // Analytics and Reports
  async getStockAnalytics(stationId?: string) {
    const queryBuilder = this.stockStationRepository
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.station', 'station')
      .leftJoinAndSelect('stock.Product', 'Product');

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
      .leftJoinAndSelect('stock.Product', 'Product')
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