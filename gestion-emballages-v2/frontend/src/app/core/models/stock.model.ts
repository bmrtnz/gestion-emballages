import { Station } from './station.model';
import { Article } from './article.model';
import { User } from './user.model';
import { FournisseurSite } from './fournisseur.model';

export interface StockStation {
  id: string;
  stationId: string;
  articleId: string;
  quantiteActuelle: number;
  seuilAlerte?: number;
  seuilCritique?: number;
  derniereMiseAJour: Date;
  updatedById?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  station: Station;
  article: Article;
  updatedBy?: User;
}

export interface StockFournisseur {
  id: string;
  fournisseurSiteId: string;
  articleId: string;
  quantiteDisponible: number;
  derniereMiseAJour: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  fournisseurSite: FournisseurSite;
  article: Article;
}

// Request/Response interfaces
export interface CreateStockStationRequest {
  stationId: string;
  articleId: string;
  quantiteActuelle: number;
  seuilAlerte?: number;
  seuilCritique?: number;
}

export interface UpdateStockStationRequest {
  quantiteActuelle?: number;
  seuilAlerte?: number;
  seuilCritique?: number;
}

export interface AdjustStockRequest {
  ajustement: number;
  raison?: string;
}

export interface CreateStockFournisseurRequest {
  fournisseurSiteId: string;
  articleId: string;
  quantiteDisponible: number;
}

export interface UpdateStockFournisseurRequest {
  quantiteDisponible?: number;
}

export interface StockFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  stationId?: string;
  fournisseurId?: string;
  articleId?: string;
  lowStock?: boolean;
  criticalStock?: boolean;
  availableOnly?: boolean;
}

export interface PaginatedStockStationsResponse {
  data: StockStation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedStockFournisseursResponse {
  data: StockFournisseur[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface StockAnalytics {
  totalArticles: number;
  lowStockItems: number;
  criticalStockItems: number;
  outOfStockItems: number;
  totalQuantity: number;
  stockStatus: {
    normal: number;
    lowStock: number;
    critical: number;
    outOfStock: number;
  };
}

export interface StockMovement {
  id: string;
  date: Date;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason?: string;
  reference?: string;
  user?: User;
}

export interface StockMovements {
  articleId: string;
  stationId?: string;
  movements: StockMovement[];
  period: string;
  totalIn: number;
  totalOut: number;
  netChange: number;
}

export enum StockStatus {
  NORMAL = 'normal',
  LOW = 'low',
  CRITICAL = 'critical',
  OUT_OF_STOCK = 'out_of_stock'
}

export interface StockAlert {
  id: string;
  type: StockStatus;
  message: string;
  stock: StockStation;
  priority: 'low' | 'medium' | 'high';
}