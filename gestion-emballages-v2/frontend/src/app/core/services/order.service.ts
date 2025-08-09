import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@environments/environment';
import {
  Order,
  MasterOrder,
  CreateOrderRequest,
  UpdateOrderRequest,
  CreateMasterOrderRequest,
  UpdateMasterOrderRequest,
  OrderFilters,
  PaginatedOrdersResponse,
  PaginatedMasterOrdersResponse,
  OrderStatus,
  OrderStatusOption
} from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/orders`;

  // Individual Orders
  getOrders(filters?: OrderFilters): Observable<PaginatedOrdersResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof OrderFilters];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedOrdersResponse>(this.baseUrl, { params });
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  createOrder(order: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, order);
  }

  updateOrder(id: string, order: UpdateOrderRequest): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/${id}`, order);
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/${id}/status`, { status });
  }

  deleteOrder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Master Orders
  getMasterOrders(filters?: OrderFilters): Observable<PaginatedMasterOrdersResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof OrderFilters];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedMasterOrdersResponse>(`${this.baseUrl}/master/list`, { params });
  }

  getMasterOrder(id: string): Observable<MasterOrder> {
    return this.http.get<MasterOrder>(`${this.baseUrl}/master/${id}`);
  }

  createMasterOrder(masterOrder: CreateMasterOrderRequest): Observable<MasterOrder> {
    return this.http.post<MasterOrder>(`${this.baseUrl}/master`, masterOrder);
  }

  updateMasterOrder(id: string, masterOrder: UpdateMasterOrderRequest): Observable<MasterOrder> {
    return this.http.patch<MasterOrder>(`${this.baseUrl}/master/${id}`, masterOrder);
  }

  updateMasterOrderStatus(id: string, generalStatus: OrderStatus): Observable<MasterOrder> {
    return this.http.patch<MasterOrder>(`${this.baseUrl}/master/${id}/status`, { generalStatus });
  }

  deleteMasterOrder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/master/${id}`);
  }

  // Utility methods
  getOrderStatuses(): Observable<{ statuses: OrderStatusOption[] }> {
    return this.http.get<{ statuses: OrderStatusOption[] }>(`${this.baseUrl}/status/list`);
  }

  getStatusDisplayName(status: OrderStatus): string {
    return status;
  }

  getStatusClass(status: OrderStatus): string {
    const statusClasses = {
      [OrderStatus.ENREGISTREE]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
      [OrderStatus.CONFIRMEE]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
      [OrderStatus.EXPEDIEE]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
      [OrderStatus.RECEPTIONNEE]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800',
      [OrderStatus.CLOTUREE]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
      [OrderStatus.FACTUREE]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800',
      [OrderStatus.ARCHIVEE]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
  }

  canUpdateStatus(currentStatus: OrderStatus, userRole: string): boolean {
    // Define allowed transitions based on user role
    const allowedTransitions = {
      'MANAGER': Object.values(OrderStatus),
      'HANDLER': Object.values(OrderStatus),
      'STATION': [OrderStatus.ENREGISTREE, OrderStatus.RECEPTIONNEE, OrderStatus.CLOTUREE],
      'SUPPLIER': [OrderStatus.CONFIRMEE, OrderStatus.EXPEDIEE]
    };

    return allowedTransitions[userRole as keyof typeof allowedTransitions]?.includes(currentStatus) || false;
  }

  getNextPossibleStatuses(currentStatus: OrderStatus, userRole: string): OrderStatus[] {
    const transitions = {
      [OrderStatus.ENREGISTREE]: userRole === 'SUPPLIER' ? [OrderStatus.CONFIRMEE] : [],
      [OrderStatus.CONFIRMEE]: userRole === 'SUPPLIER' ? [OrderStatus.EXPEDIEE] : [],
      [OrderStatus.EXPEDIEE]: userRole === 'STATION' ? [OrderStatus.RECEPTIONNEE] : [],
      [OrderStatus.RECEPTIONNEE]: userRole === 'STATION' ? [OrderStatus.CLOTUREE] : [],
      [OrderStatus.CLOTUREE]: ['MANAGER', 'HANDLER'].includes(userRole) ? [OrderStatus.FACTUREE] : [],
      [OrderStatus.FACTUREE]: ['MANAGER', 'HANDLER'].includes(userRole) ? [OrderStatus.ARCHIVEE] : [],
      [OrderStatus.ARCHIVEE]: []
    };

    // Managers and Handlers can also archive at any stage
    if (['MANAGER', 'HANDLER'].includes(userRole) && currentStatus !== OrderStatus.ARCHIVEE) {
      const possibleStatuses = transitions[currentStatus] || [];
      if (!possibleStatuses.includes(OrderStatus.ARCHIVEE)) {
        possibleStatuses.push(OrderStatus.ARCHIVEE);
      }
      return possibleStatuses;
    }

    return transitions[currentStatus] || [];
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
  }

  formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }

  calculateOrderTotal(order: Order): number {
    return order.orderProducts.reduce(
      (total, product) => total + (product.orderedQuantity * product.unitPrice),
      0
    );
  }

  getOrderProgress(status: OrderStatus): { percentage: number; label: string } {
    const progressMapping = {
      [OrderStatus.ENREGISTREE]: { percentage: 10, label: 'Enregistrée' },
      [OrderStatus.CONFIRMEE]: { percentage: 25, label: 'Confirmée' },
      [OrderStatus.EXPEDIEE]: { percentage: 50, label: 'Expédiée' },
      [OrderStatus.RECEPTIONNEE]: { percentage: 75, label: 'Réceptionnée' },
      [OrderStatus.CLOTUREE]: { percentage: 90, label: 'Clôturée' },
      [OrderStatus.FACTUREE]: { percentage: 95, label: 'Facturée' },
      [OrderStatus.ARCHIVEE]: { percentage: 100, label: 'Archivée' }
    };

    return progressMapping[status] || { percentage: 0, label: 'Inconnu' };
  }
}