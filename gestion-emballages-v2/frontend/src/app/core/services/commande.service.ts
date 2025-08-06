import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@environments/environment';
import {
  Commande,
  CommandeGlobale,
  CreateCommandeRequest,
  UpdateCommandeRequest,
  CreateCommandeGlobaleRequest,
  UpdateCommandeGlobaleRequest,
  CommandeFilters,
  PaginatedCommandesResponse,
  PaginatedCommandesGlobalesResponse,
  OrderStatus,
  OrderStatusOption
} from '../models/commande.model';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/commandes`;

  // Individual Orders (Commandes)
  getCommandes(filters?: CommandeFilters): Observable<PaginatedCommandesResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof CommandeFilters];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedCommandesResponse>(this.baseUrl, { params });
  }

  getCommande(id: string): Observable<Commande> {
    return this.http.get<Commande>(`${this.baseUrl}/${id}`);
  }

  createCommande(commande: CreateCommandeRequest): Observable<Commande> {
    return this.http.post<Commande>(this.baseUrl, commande);
  }

  updateCommande(id: string, commande: UpdateCommandeRequest): Observable<Commande> {
    return this.http.patch<Commande>(`${this.baseUrl}/${id}`, commande);
  }

  updateCommandeStatus(id: string, statut: OrderStatus): Observable<Commande> {
    return this.http.patch<Commande>(`${this.baseUrl}/${id}/status`, { statut });
  }

  deleteCommande(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Global Orders (Commandes Globales)
  getCommandesGlobales(filters?: CommandeFilters): Observable<PaginatedCommandesGlobalesResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof CommandeFilters];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedCommandesGlobalesResponse>(`${this.baseUrl}/globales/list`, { params });
  }

  getCommandeGlobale(id: string): Observable<CommandeGlobale> {
    return this.http.get<CommandeGlobale>(`${this.baseUrl}/globales/${id}`);
  }

  createCommandeGlobale(commandeGlobale: CreateCommandeGlobaleRequest): Observable<CommandeGlobale> {
    return this.http.post<CommandeGlobale>(`${this.baseUrl}/globales`, commandeGlobale);
  }

  updateCommandeGlobale(id: string, commandeGlobale: UpdateCommandeGlobaleRequest): Observable<CommandeGlobale> {
    return this.http.patch<CommandeGlobale>(`${this.baseUrl}/globales/${id}`, commandeGlobale);
  }

  updateCommandeGlobaleStatus(id: string, statutGeneral: OrderStatus): Observable<CommandeGlobale> {
    return this.http.patch<CommandeGlobale>(`${this.baseUrl}/globales/${id}/status`, { statutGeneral });
  }

  deleteCommandeGlobale(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/globales/${id}`);
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
      'Manager': Object.values(OrderStatus),
      'Gestionnaire': Object.values(OrderStatus),
      'Station': [OrderStatus.ENREGISTREE, OrderStatus.RECEPTIONNEE, OrderStatus.CLOTUREE],
      'Fournisseur': [OrderStatus.CONFIRMEE, OrderStatus.EXPEDIEE]
    };

    return allowedTransitions[userRole as keyof typeof allowedTransitions]?.includes(currentStatus) || false;
  }

  getNextPossibleStatuses(currentStatus: OrderStatus, userRole: string): OrderStatus[] {
    const transitions = {
      [OrderStatus.ENREGISTREE]: userRole === 'Fournisseur' ? [OrderStatus.CONFIRMEE] : [],
      [OrderStatus.CONFIRMEE]: userRole === 'Fournisseur' ? [OrderStatus.EXPEDIEE] : [],
      [OrderStatus.EXPEDIEE]: userRole === 'Station' ? [OrderStatus.RECEPTIONNEE] : [],
      [OrderStatus.RECEPTIONNEE]: userRole === 'Station' ? [OrderStatus.CLOTUREE] : [],
      [OrderStatus.CLOTUREE]: ['Manager', 'Gestionnaire'].includes(userRole) ? [OrderStatus.FACTUREE] : [],
      [OrderStatus.FACTUREE]: ['Manager', 'Gestionnaire'].includes(userRole) ? [OrderStatus.ARCHIVEE] : [],
      [OrderStatus.ARCHIVEE]: []
    };

    // Managers and Gestionnaires can also archive at any stage
    if (['Manager', 'Gestionnaire'].includes(userRole) && currentStatus !== OrderStatus.ARCHIVEE) {
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

  calculateOrderTotal(commande: Commande): number {
    return commande.commandeArticles.reduce(
      (total, article) => total + (article.quantiteCommandee * article.prixUnitaire),
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