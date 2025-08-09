import { Station } from './station.model';
import { Product } from './product.model';
import { User } from './user.model';
import { SupplierSite } from './supplier.model';

export interface StockStation {
  id: string;
  stationId: string;
  productId: string;
  quantiteActuelle: number;
  seuilAlerte?: number;
  seuilCritique?: number;
  derniereMiseAJour: Date;
  updatedById?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  station: Station;
  product: Product;
  updatedBy?: User;
}

export interface StockSupplier {
  id: string;
  supplierSiteId: string;
  productId: string;
  quantiteDisponible: number;
  derniereMiseAJour: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  supplierSite: SupplierSite;
  product: Product;
}

// Request/Response interfaces
export interface CreateStockStationRequest {
  stationId: string;
  productId: string;
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

export interface CreateStockSupplierRequest {
  supplierSiteId: string;
  productId: string;
  quantiteDisponible: number;
}

export interface UpdateStockSupplierRequest {
  quantiteDisponible?: number;
}

export interface StockFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  stationId?: string;
  supplierId?: string;
  productId?: string;
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

export interface PaginatedStockSuppliersResponse {
  data: StockSupplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface StockAnalytics {
  totalProducts: number;
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
  productId: string;
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