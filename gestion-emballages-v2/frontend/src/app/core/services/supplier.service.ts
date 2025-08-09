import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { 
  Supplier, 
  CreateSupplierRequest, 
  UpdateSupplierRequest, 
  SupplierFilters, 
  PaginatedSuppliersResponse 
} from '../models/supplier.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private readonly baseUrl = `${environment.apiUrl}/suppliers`;

  constructor(private http: HttpClient) {}

  async getSuppliers(filters: SupplierFilters = {}): Promise<PaginatedSuppliersResponse> {
    let params = new HttpParams();
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.specialty) params = params.set('specialty', filters.specialty);

    return firstValueFrom(
      this.http.get<PaginatedSuppliersResponse>(this.baseUrl, { params })
    );
  }

  async getSupplier(id: string): Promise<Supplier> {
    return firstValueFrom(
      this.http.get<Supplier>(`${this.baseUrl}/${id}`)
    );
  }

  async createSupplier(supplier: CreateSupplierRequest): Promise<Supplier> {
    return firstValueFrom(
      this.http.post<Supplier>(this.baseUrl, supplier)
    );
  }

  async updateSupplier(id: string, supplier: UpdateSupplierRequest): Promise<Supplier> {
    return firstValueFrom(
      this.http.put<Supplier>(`${this.baseUrl}/${id}`, supplier)
    );
  }

  async deactivateSupplier(id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/${id}`)
    );
  }

  async reactivateSupplier(id: string): Promise<Supplier> {
    return firstValueFrom(
      this.http.patch<Supplier>(`${this.baseUrl}/${id}/reactivate`, {})
    );
  }

  async getActiveSuppliers(): Promise<Supplier[]> {
    const response = await this.getSuppliers({ status: 'active', limit: 1000 });
    return response.data;
  }

  async getSupplierSites(id: string): Promise<any[]> {
    return firstValueFrom(
      this.http.get<any[]>(`${this.baseUrl}/${id}/sites`)
    );
  }

  async addSupplierSite(id: string, site: any): Promise<any> {
    return firstValueFrom(
      this.http.post<any>(`${this.baseUrl}/${id}/sites`, site)
    );
  }

  async updateSupplierSite(supplierId: string, siteId: string, site: any): Promise<any> {
    return firstValueFrom(
      this.http.put<any>(`${this.baseUrl}/${supplierId}/sites/${siteId}`, site)
    );
  }

  async deleteSupplierSite(supplierId: string, siteId: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/${supplierId}/sites/${siteId}`)
    );
  }
}