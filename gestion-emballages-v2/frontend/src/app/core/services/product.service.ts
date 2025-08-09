import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@environments/environment';
import { 
  Product, 
  CreateProductRequest, 
  UpdateProductRequest,
  CreateProductSupplierRequest,
  ProductSupplier,
  PaginatedProductsResponse,
  ProductCategory
} from '../models/product.model';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: 'active' | 'inactive' | '';
  category?: ProductCategory | '';
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/products`;

  // Product CRUD operations
  getProducts(filters?: ProductFilters): Observable<PaginatedProductsResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof ProductFilters];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedProductsResponse>(this.baseUrl, { params });
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  createProduct(product: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product);
  }

  updateProduct(id: string, product: UpdateProductRequest): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  reactivateProduct(id: string): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/${id}/reactivate`, {});
  }

  // Product-Supplier relationship operations
  addSupplier(productId: string, supplierData: CreateProductSupplierRequest): Observable<ProductSupplier> {
    return this.http.post<ProductSupplier>(`${this.baseUrl}/${productId}/suppliers`, supplierData);
  }

  updateSupplier(
    productId: string, 
    supplierInfoId: string, 
    supplierData: Partial<CreateProductSupplierRequest>
  ): Observable<ProductSupplier> {
    return this.http.patch<ProductSupplier>(
      `${this.baseUrl}/${productId}/suppliers/${supplierInfoId}`, 
      supplierData
    );
  }

  removeSupplier(productId: string, supplierInfoId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${productId}/suppliers/${supplierInfoId}`);
  }

  // Utility methods
  getCategories(): Observable<{ categories: ProductCategory[] }> {
    return this.http.get<{ categories: ProductCategory[] }>(`${this.baseUrl}/categories`);
  }

  searchProducts(query: string, limit?: number): Observable<Product[]> {
    let params = new HttpParams().set('q', query);
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    return this.http.get<Product[]>(`${this.baseUrl}/search`, { params });
  }

  // Helper methods for display
  getCategoryDisplayName(category: ProductCategory): string {
    return category; // Categories are already in English
  }

  formatSupplierDelay(days?: number): string {
    if (!days) return 'Non spécifié';
    return `${days} jour${days > 1 ? 's' : ''}`;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  getLowestPrice(productSuppliers: ProductSupplier[]): number | null {
    if (!productSuppliers?.length) return null;
    return Math.min(...productSuppliers.map(ps => ps.unitPrice));
  }

  getHighestPrice(productSuppliers: ProductSupplier[]): number | null {
    if (!productSuppliers?.length) return null;
    return Math.max(...productSuppliers.map(ps => ps.unitPrice));
  }

  getSuppliersCount(productSuppliers: ProductSupplier[]): number {
    return productSuppliers?.length || 0;
  }
}