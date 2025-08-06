import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable, BehaviorSubject, firstValueFrom } from 'rxjs';

export interface ShoppingCartItem {
  id: string;
  articleId: string;
  fournisseurId: string;
  quantite: number;
  // Add other properties as needed
}

export interface ShoppingCart {
  id?: string;
  articles?: ShoppingCartItem[];
}

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {
  private readonly apiUrl = `${environment.apiUrl}/listes-achat`;
  
  private activeCartSubject = new BehaviorSubject<ShoppingCart | null>(null);
  public activeCart$ = this.activeCartSubject.asObservable();

  // Signals for reactive UI
  public activeCart = signal<ShoppingCart | null>(null);
  public cartItemsCount = computed(() => {
    const cart = this.activeCart();
    return cart?.articles?.length || 0;
  });

  constructor(private http: HttpClient) {}

  /**
   * Fetch the active shopping cart for the current station user
   */
  fetchActiveCart(): Observable<ShoppingCart> {
    return this.http.get<ShoppingCart>(this.apiUrl);
  }

  /**
   * Load active cart and update signals
   */
  async loadActiveCart(): Promise<void> {
    try {
      const cart = await firstValueFrom(this.fetchActiveCart());
      this.activeCart.set(cart || null);
      this.activeCartSubject.next(cart || null);
    } catch (error) {
      console.error('Error loading active cart:', error);
      this.activeCart.set(null);
      this.activeCartSubject.next(null);
    }
  }

  /**
   * Add item to shopping cart
   */
  addItem(item: Partial<ShoppingCartItem>): Observable<any> {
    return this.http.post(this.apiUrl, item);
  }

  /**
   * Remove item from shopping cart
   */
  removeItem(itemId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/items/${itemId}`);
  }

  /**
   * Validate shopping cart (convert to orders)
   */
  validateCart(): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate`, {});
  }

  /**
   * Clear the cart
   */
  clearCart(): void {
    this.activeCart.set(null);
    this.activeCartSubject.next(null);
  }

  /**
   * Get cart items count (for backward compatibility)
   */
  getCartItemsCount(): number {
    return this.cartItemsCount();
  }
}