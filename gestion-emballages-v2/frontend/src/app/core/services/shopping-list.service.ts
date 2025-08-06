import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@environments/environment';
import {
  ListeAchat,
  ListeAchatItem,
  CreateListeAchatRequest,
  UpdateListeAchatRequest,
  AddItemToListeRequest,
  ValidateListeAchatRequest,
  ShoppingListFilters,
  PaginatedShoppingListsResponse,
  ShoppingListAnalytics,
  ShoppingListGroupedBySupplier,
  ShoppingCartItem
} from '../models/shopping-list.model';
import { Commande } from '../models/commande.model';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/listes-achat`;

  // Shopping List Management
  getShoppingLists(filters?: ShoppingListFilters): Observable<PaginatedShoppingListsResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof ShoppingListFilters];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedShoppingListsResponse>(this.baseUrl, { params });
  }

  getShoppingList(id: string): Observable<ListeAchat> {
    return this.http.get<ListeAchat>(`${this.baseUrl}/${id}`);
  }

  getActiveShoppingListByStation(stationId: string): Observable<ListeAchat> {
    return this.http.get<ListeAchat>(`${this.baseUrl}/active/${stationId}`);
  }

  createShoppingList(shoppingList: CreateListeAchatRequest): Observable<ListeAchat> {
    return this.http.post<ListeAchat>(this.baseUrl, shoppingList);
  }

  updateShoppingList(id: string, shoppingList: UpdateListeAchatRequest): Observable<ListeAchat> {
    return this.http.patch<ListeAchat>(`${this.baseUrl}/${id}`, shoppingList);
  }

  addItemToList(id: string, item: AddItemToListeRequest): Observable<ListeAchat> {
    return this.http.post<ListeAchat>(`${this.baseUrl}/${id}/items`, item);
  }

  removeItemFromList(id: string, itemId: string): Observable<ListeAchat> {
    return this.http.delete<ListeAchat>(`${this.baseUrl}/${id}/items/${itemId}`);
  }

  validateAndConvertToOrders(id: string, validation: ValidateListeAchatRequest): Observable<Commande[]> {
    return this.http.post<Commande[]>(`${this.baseUrl}/${id}/validate`, validation);
  }

  deleteShoppingList(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Analytics
  getShoppingListAnalytics(stationId?: string): Observable<ShoppingListAnalytics> {
    let params = new HttpParams();
    if (stationId) {
      params = params.set('stationId', stationId);
    }
    return this.http.get<ShoppingListAnalytics>(`${this.baseUrl}/analytics`, { params });
  }

  // Utility methods
  groupItemsBySupplier(items: ListeAchatItem[]): ShoppingListGroupedBySupplier[] {
    const grouped = new Map<string, { fournisseur: any; items: ListeAchatItem[] }>();

    items.forEach(item => {
      const fournisseurId = item.fournisseurId;
      if (!grouped.has(fournisseurId)) {
        grouped.set(fournisseurId, {
          fournisseur: item.fournisseur,
          items: []
        });
      }
      grouped.get(fournisseurId)!.items.push(item);
    });

    return Array.from(grouped.values()).map(group => ({
      fournisseur: group.fournisseur,
      items: group.items,
      totalQuantity: group.items.reduce((sum, item) => sum + item.quantite, 0)
    }));
  }

  calculateTotalItems(shoppingList: ListeAchat): number {
    return shoppingList.items.length;
  }

  calculateTotalQuantity(shoppingList: ListeAchat): number {
    return shoppingList.items.reduce((total, item) => total + item.quantite, 0);
  }

  calculateUniqueSuppliers(shoppingList: ListeAchat): number {
    const uniqueSuppliers = new Set(shoppingList.items.map(item => item.fournisseurId));
    return uniqueSuppliers.size;
  }

  getStatusDisplayName(status: string): string {
    const statusNames = {
      'active': 'Active',
      'archived': 'Archivée'
    };
    return statusNames[status as keyof typeof statusNames] || status;
  }

  getStatusClass(status: string): string {
    const statusClasses = {
      'active': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
      'archived': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
  }

  getStatusIcon(status: string): string {
    const statusIcons = {
      'active': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'archived': 'M5 8h14l-1.5 7.5A2 2 0 0115.687 17H8.313a2 2 0 01-1.938-1.5L5 8zm0 0V6a2 2 0 012-2h4a2 2 0 012 2v2m6 0V6a2 2 0 00-2-2h-4a2 2 0 00-2 2v2'
    };
    return statusIcons[status as keyof typeof statusIcons] || 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
  }

  canEditShoppingList(shoppingList: ListeAchat, userRole: string): boolean {
    return shoppingList.statut === 'active' && 
           ['Manager', 'Gestionnaire', 'Station'].includes(userRole);
  }

  canValidateShoppingList(shoppingList: ListeAchat, userRole: string): boolean {
    return shoppingList.statut === 'active' && 
           shoppingList.items && shoppingList.items.length > 0 &&
           ['Manager', 'Gestionnaire', 'Station'].includes(userRole);
  }

  canDeleteShoppingList(shoppingList: ListeAchat, userRole: string): boolean {
    return shoppingList.statut === 'active' && 
           ['Manager', 'Gestionnaire', 'Station'].includes(userRole);
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

  formatQuantity(quantity: number): string {
    return new Intl.NumberFormat('fr-FR').format(quantity);
  }

  // Shopping cart utilities (for building lists)
  createCartItem(articleId: string, fournisseurId: string, quantite: number = 1, dateSouhaitee?: Date): ShoppingCartItem {
    return {
      articleId,
      fournisseurId,
      quantite,
      dateSouhaitee_livraison: dateSouhaitee
    };
  }

  updateCartItemQuantity(items: ShoppingCartItem[], articleId: string, fournisseurId: string, newQuantity: number): ShoppingCartItem[] {
    return items.map(item => {
      if (item.articleId === articleId && item.fournisseurId === fournisseurId) {
        return { ...item, quantite: newQuantity };
      }
      return item;
    });
  }

  removeCartItem(items: ShoppingCartItem[], articleId: string, fournisseurId: string): ShoppingCartItem[] {
    return items.filter(item => !(item.articleId === articleId && item.fournisseurId === fournisseurId));
  }

  cartItemExists(items: ShoppingCartItem[], articleId: string, fournisseurId: string): boolean {
    return items.some(item => item.articleId === articleId && item.fournisseurId === fournisseurId);
  }

  getCartTotalQuantity(items: ShoppingCartItem[]): number {
    return items.reduce((total, item) => total + item.quantite, 0);
  }

  getCartUniqueSuppliers(items: ShoppingCartItem[]): number {
    const uniqueSuppliers = new Set(items.map(item => item.fournisseurId));
    return uniqueSuppliers.size;
  }

  isShoppingListEmpty(shoppingList: ListeAchat): boolean {
    return !shoppingList.items || shoppingList.items.length === 0;
  }

  isShoppingListActive(shoppingList: ListeAchat): boolean {
    return shoppingList.statut === 'active';
  }

  isShoppingListArchived(shoppingList: ListeAchat): boolean {
    return shoppingList.statut === 'archived';
  }

  getItemsRequiringDeliveryDate(items: ListeAchatItem[]): ListeAchatItem[] {
    return items.filter(item => !item.dateSouhaitee_livraison);
  }

  validateShoppingListForConversion(shoppingList: ListeAchat): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (shoppingList.statut !== 'active') {
      errors.push('La liste doit être active pour être validée');
    }

    if (!shoppingList.items || shoppingList.items.length === 0) {
      errors.push('La liste ne peut pas être vide');
    }

    const itemsWithoutDate = this.getItemsRequiringDeliveryDate(shoppingList.items);
    if (itemsWithoutDate.length > 0) {
      errors.push(`${itemsWithoutDate.length} article(s) n'ont pas de date de livraison souhaitée`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}