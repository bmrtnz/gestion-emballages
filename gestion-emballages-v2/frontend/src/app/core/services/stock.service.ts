import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@environments/environment';
import {
  StockStation,
  StockFournisseur,
  CreateStockStationRequest,
  UpdateStockStationRequest,
  AdjustStockRequest,
  CreateStockFournisseurRequest,
  UpdateStockFournisseurRequest,
  StockFilters,
  PaginatedStockStationsResponse,
  PaginatedStockFournisseursResponse,
  StockAnalytics,
  StockMovements,
  StockStatus
} from '../models/stock.model';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/stocks`;

  // Station Stock Management
  getStockStations(filters?: StockFilters): Observable<PaginatedStockStationsResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof StockFilters];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedStockStationsResponse>(`${this.baseUrl}/stations`, { params });
  }

  getStockStation(id: string): Observable<StockStation> {
    return this.http.get<StockStation>(`${this.baseUrl}/stations/${id}`);
  }

  getStockByStationAndArticle(stationId: string, articleId: string): Observable<StockStation> {
    return this.http.get<StockStation>(`${this.baseUrl}/stations/by-location/${stationId}/article/${articleId}`);
  }

  createStockStation(stock: CreateStockStationRequest): Observable<StockStation> {
    return this.http.post<StockStation>(`${this.baseUrl}/stations`, stock);
  }

  updateStockStation(id: string, stock: UpdateStockStationRequest): Observable<StockStation> {
    return this.http.patch<StockStation>(`${this.baseUrl}/stations/${id}`, stock);
  }

  adjustStockStation(id: string, adjustment: AdjustStockRequest): Observable<StockStation> {
    return this.http.patch<StockStation>(`${this.baseUrl}/stations/${id}/adjust`, adjustment);
  }

  deleteStockStation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/stations/${id}`);
  }

  // Supplier Stock Management
  getStockFournisseurs(filters?: StockFilters): Observable<PaginatedStockFournisseursResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof StockFilters];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedStockFournisseursResponse>(`${this.baseUrl}/fournisseurs`, { params });
  }

  getStockFournisseur(id: string): Observable<StockFournisseur> {
    return this.http.get<StockFournisseur>(`${this.baseUrl}/fournisseurs/${id}`);
  }

  getStockByFournisseurSiteAndArticle(fournisseurSiteId: string, articleId: string): Observable<StockFournisseur> {
    return this.http.get<StockFournisseur>(`${this.baseUrl}/fournisseurs/by-location/${fournisseurSiteId}/article/${articleId}`);
  }

  createStockFournisseur(stock: CreateStockFournisseurRequest): Observable<StockFournisseur> {
    return this.http.post<StockFournisseur>(`${this.baseUrl}/fournisseurs`, stock);
  }

  updateStockFournisseur(id: string, stock: UpdateStockFournisseurRequest): Observable<StockFournisseur> {
    return this.http.patch<StockFournisseur>(`${this.baseUrl}/fournisseurs/${id}`, stock);
  }

  deleteStockFournisseur(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/fournisseurs/${id}`);
  }

  // Analytics and Reports
  getStockAnalytics(stationId?: string): Observable<StockAnalytics> {
    let params = new HttpParams();
    if (stationId) {
      params = params.set('stationId', stationId);
    }
    return this.http.get<StockAnalytics>(`${this.baseUrl}/analytics/overview`, { params });
  }

  getLowStockAlerts(stationId?: string): Observable<StockStation[]> {
    let params = new HttpParams();
    if (stationId) {
      params = params.set('stationId', stationId);
    }
    return this.http.get<StockStation[]>(`${this.baseUrl}/alerts/low-stock`, { params });
  }

  getStockMovements(articleId: string, stationId?: string, days?: number): Observable<StockMovements> {
    let params = new HttpParams();
    if (stationId) {
      params = params.set('stationId', stationId);
    }
    if (days) {
      params = params.set('days', days.toString());
    }
    return this.http.get<StockMovements>(`${this.baseUrl}/movements/${articleId}`, { params });
  }

  // Utility methods
  getStockStatus(stock: StockStation): StockStatus {
    if (stock.quantiteActuelle === 0) {
      return StockStatus.OUT_OF_STOCK;
    }
    
    if (stock.seuilCritique && stock.quantiteActuelle <= stock.seuilCritique) {
      return StockStatus.CRITICAL;
    }
    
    if (stock.seuilAlerte && stock.quantiteActuelle <= stock.seuilAlerte) {
      return StockStatus.LOW;
    }
    
    return StockStatus.NORMAL;
  }

  getStockStatusClass(status: StockStatus): string {
    const statusClasses = {
      [StockStatus.NORMAL]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
      [StockStatus.LOW]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
      [StockStatus.CRITICAL]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
      [StockStatus.OUT_OF_STOCK]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
    };
    return statusClasses[status];
  }

  getStockStatusLabel(status: StockStatus): string {
    const statusLabels = {
      [StockStatus.NORMAL]: 'Stock normal',
      [StockStatus.LOW]: 'Stock faible',
      [StockStatus.CRITICAL]: 'Stock critique', 
      [StockStatus.OUT_OF_STOCK]: 'Rupture de stock'
    };
    return statusLabels[status];
  }

  getStockStatusIcon(status: StockStatus): string {
    const statusIcons = {
      [StockStatus.NORMAL]: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      [StockStatus.LOW]: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z',
      [StockStatus.CRITICAL]: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      [StockStatus.OUT_OF_STOCK]: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    return statusIcons[status];
  }

  formatQuantity(quantity: number): string {
    return new Intl.NumberFormat('fr-FR').format(quantity);
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }

  calculateStockValue(stock: StockStation, unitPrice?: number): number {
    if (!unitPrice) return 0;
    return stock.quantiteActuelle * unitPrice;
  }

  getStockHealthPercentage(analytics: StockAnalytics): number {
    if (analytics.totalArticles === 0) return 100;
    const healthyItems = analytics.stockStatus.normal;
    return Math.round((healthyItems / analytics.totalArticles) * 100);
  }

  getRecommendedOrderQuantity(stock: StockStation, averageConsumption?: number): number {
    if (!averageConsumption || !stock.seuilAlerte) return 0;
    
    // Simple reorder formula: bring stock up to 2x alert threshold
    const targetStock = stock.seuilAlerte * 2;
    const recommendedQuantity = Math.max(0, targetStock - stock.quantiteActuelle);
    
    return Math.ceil(recommendedQuantity);
  }

  isStockCritical(stock: StockStation): boolean {
    return this.getStockStatus(stock) === StockStatus.CRITICAL;
  }

  isStockLow(stock: StockStation): boolean {
    const status = this.getStockStatus(stock);
    return status === StockStatus.LOW || status === StockStatus.CRITICAL;
  }

  isOutOfStock(stock: StockStation): boolean {
    return this.getStockStatus(stock) === StockStatus.OUT_OF_STOCK;
  }

  canAdjustStock(userRole: string): boolean {
    return ['Manager', 'Gestionnaire', 'Station'].includes(userRole);
  }

  canDeleteStock(userRole: string): boolean {
    return ['Manager', 'Gestionnaire'].includes(userRole);
  }

  canManageSupplierStock(userRole: string): boolean {
    return ['Manager', 'Gestionnaire', 'Fournisseur'].includes(userRole);
  }
}