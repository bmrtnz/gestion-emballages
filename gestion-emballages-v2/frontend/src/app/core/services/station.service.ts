import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { 
  Station, 
  CreateStationRequest, 
  UpdateStationRequest, 
  StationFilters, 
  PaginatedStationsResponse 
} from '../models/station.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StationService {
  private readonly baseUrl = `${environment.apiUrl}/stations`;

  constructor(private http: HttpClient) {}

  async getStations(filters: StationFilters = {}): Promise<PaginatedStationsResponse> {
    let params = new HttpParams();
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    if (filters.status) params = params.set('status', filters.status);

    return firstValueFrom(
      this.http.get<PaginatedStationsResponse>(this.baseUrl, { params })
    );
  }

  async getStation(id: string): Promise<Station> {
    return firstValueFrom(
      this.http.get<Station>(`${this.baseUrl}/${id}`)
    );
  }

  async createStation(station: CreateStationRequest): Promise<Station> {
    return firstValueFrom(
      this.http.post<Station>(this.baseUrl, station)
    );
  }

  async updateStation(id: string, station: UpdateStationRequest): Promise<Station> {
    return firstValueFrom(
      this.http.put<Station>(`${this.baseUrl}/${id}`, station)
    );
  }

  async deactivateStation(id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/${id}`)
    );
  }

  async reactivateStation(id: string): Promise<Station> {
    return firstValueFrom(
      this.http.patch<Station>(`${this.baseUrl}/${id}/reactivate`, {})
    );
  }

  async getActiveStations(): Promise<Station[]> {
    return firstValueFrom(
      this.http.get<Station[]>(`${this.baseUrl}/active`)
    );
  }
}