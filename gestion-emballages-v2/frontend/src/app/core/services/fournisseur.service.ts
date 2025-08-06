import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { 
  Fournisseur, 
  CreateFournisseurRequest, 
  UpdateFournisseurRequest, 
  FournisseurFilters, 
  PaginatedFournisseursResponse 
} from '../models/fournisseur.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FournisseurService {
  private readonly baseUrl = `${environment.apiUrl}/fournisseurs`;

  constructor(private http: HttpClient) {}

  async getFournisseurs(filters: FournisseurFilters = {}): Promise<PaginatedFournisseursResponse> {
    let params = new HttpParams();
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.specialite) params = params.set('specialite', filters.specialite);

    return firstValueFrom(
      this.http.get<PaginatedFournisseursResponse>(this.baseUrl, { params })
    );
  }

  async getFournisseur(id: string): Promise<Fournisseur> {
    return firstValueFrom(
      this.http.get<Fournisseur>(`${this.baseUrl}/${id}`)
    );
  }

  async createFournisseur(fournisseur: CreateFournisseurRequest): Promise<Fournisseur> {
    return firstValueFrom(
      this.http.post<Fournisseur>(this.baseUrl, fournisseur)
    );
  }

  async updateFournisseur(id: string, fournisseur: UpdateFournisseurRequest): Promise<Fournisseur> {
    return firstValueFrom(
      this.http.put<Fournisseur>(`${this.baseUrl}/${id}`, fournisseur)
    );
  }

  async deactivateFournisseur(id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/${id}`)
    );
  }

  async reactivateFournisseur(id: string): Promise<Fournisseur> {
    return firstValueFrom(
      this.http.patch<Fournisseur>(`${this.baseUrl}/${id}/reactivate`, {})
    );
  }

  async getActiveFournisseurs(): Promise<Fournisseur[]> {
    const response = await this.getFournisseurs({ status: 'active', limit: 1000 });
    return response.data;
  }

  async getFournisseurSites(id: string): Promise<any[]> {
    return firstValueFrom(
      this.http.get<any[]>(`${this.baseUrl}/${id}/sites`)
    );
  }

  async addFournisseurSite(id: string, site: any): Promise<any> {
    return firstValueFrom(
      this.http.post<any>(`${this.baseUrl}/${id}/sites`, site)
    );
  }

  async updateFournisseurSite(fournisseurId: string, siteId: string, site: any): Promise<any> {
    return firstValueFrom(
      this.http.put<any>(`${this.baseUrl}/${fournisseurId}/sites/${siteId}`, site)
    );
  }

  async deleteFournisseurSite(fournisseurId: string, siteId: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/${fournisseurId}/sites/${siteId}`)
    );
  }
}