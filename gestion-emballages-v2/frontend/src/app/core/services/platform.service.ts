import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Platform, PlatformSite, CreatePlatformDto, UpdatePlatformDto, CreatePlatformSiteDto } from '../models/platform.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  private readonly apiUrl = `${environment.apiUrl}/platforms`;
  private http = inject(HttpClient);

  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    status?: string;
    specialite?: string;
  }): Observable<PaginatedResponse<Platform>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Platform>>(this.apiUrl, { params: httpParams });
  }

  getActive(): Observable<{ statusCode: number; data: Platform[] }> {
    return this.http.get<{ statusCode: number; data: Platform[] }>(`${this.apiUrl}/active`);
  }

  getById(id: string): Observable<{ statusCode: number; data: Platform }> {
    return this.http.get<{ statusCode: number; data: Platform }>(`${this.apiUrl}/${id}`);
  }

  create(platform: CreatePlatformDto): Observable<{ statusCode: number; message: string; data: Platform }> {
    return this.http.post<{ statusCode: number; message: string; data: Platform }>(this.apiUrl, platform);
  }

  update(id: string, platform: UpdatePlatformDto): Observable<{ statusCode: number; message: string; data: Platform }> {
    return this.http.patch<{ statusCode: number; message: string; data: Platform }>(`${this.apiUrl}/${id}`, platform);
  }

  delete(id: string): Observable<{ statusCode: number; message: string }> {
    return this.http.delete<{ statusCode: number; message: string }>(`${this.apiUrl}/${id}`);
  }

  // Platform sites management
  createSite(platformId: string, site: CreatePlatformSiteDto): Observable<{ statusCode: number; message: string; data: PlatformSite }> {
    return this.http.post<{ statusCode: number; message: string; data: PlatformSite }>(`${this.apiUrl}/${platformId}/sites`, site);
  }

  updateSite(platformId: string, siteId: string, site: CreatePlatformSiteDto): Observable<{ statusCode: number; message: string; data: PlatformSite }> {
    return this.http.patch<{ statusCode: number; message: string; data: PlatformSite }>(`${this.apiUrl}/${platformId}/sites/${siteId}`, site);
  }

  deleteSite(platformId: string, siteId: string): Observable<{ statusCode: number; message: string }> {
    return this.http.delete<{ statusCode: number; message: string }>(`${this.apiUrl}/${platformId}/sites/${siteId}`);
  }
}