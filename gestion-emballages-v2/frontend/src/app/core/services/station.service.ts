import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { 
  Station, 
  StationGroup,
  CreateStationRequest, 
  UpdateStationRequest, 
  CreateStationGroupRequest,
  UpdateStationGroupRequest,
  StationFilters,
  StationGroupFilters,
  PaginatedStationsResponse,
  PaginatedStationGroupsResponse,
  StationStatistics
} from '../models/station.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StationService {
  private readonly baseUrl = `${environment.apiUrl}/stations`;
  private readonly groupsUrl = `${environment.apiUrl}/station-groups`;

  constructor(private http: HttpClient) {}

  // Station CRUD operations
  getStations(filters: StationFilters = {}): Observable<PaginatedStationsResponse> {
    let params = new HttpParams();
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.stationGroupId) params = params.set('stationGroupId', filters.stationGroupId);
    if (filters.city) params = params.set('city', filters.city);
    if (filters.country) params = params.set('country', filters.country);
    if (filters.stationType) params = params.set('stationType', filters.stationType);

    return this.http.get<PaginatedStationsResponse>(this.baseUrl, { params });
  }

  getStation(id: string): Observable<Station> {
    return this.http.get<Station>(`${this.baseUrl}/${id}`);
  }

  createStation(station: CreateStationRequest): Observable<Station> {
    return this.http.post<Station>(this.baseUrl, station);
  }

  updateStation(id: string, station: UpdateStationRequest): Observable<Station> {
    return this.http.put<Station>(`${this.baseUrl}/${id}`, station);
  }

  deleteStation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  reactivateStation(id: string): Observable<Station> {
    return this.http.patch<Station>(`${this.baseUrl}/${id}/reactivate`, {});
  }

  getActiveStations(): Observable<Station[]> {
    return this.http.get<Station[]>(`${this.baseUrl}/active`);
  }

  getStationStatistics(): Observable<StationStatistics> {
    return this.http.get<StationStatistics>(`${this.baseUrl}/statistics`);
  }

  // Station Group CRUD operations
  getStationGroups(filters: StationGroupFilters = {}): Observable<PaginatedStationGroupsResponse> {
    let params = new HttpParams();
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    if (filters.status) params = params.set('status', filters.status);

    return this.http.get<PaginatedStationGroupsResponse>(this.groupsUrl, { params });
  }

  getStationGroup(id: string): Observable<StationGroup> {
    return this.http.get<StationGroup>(`${this.groupsUrl}/${id}`);
  }

  createStationGroup(group: CreateStationGroupRequest): Observable<StationGroup> {
    return this.http.post<StationGroup>(this.groupsUrl, group);
  }

  updateStationGroup(id: string, group: UpdateStationGroupRequest): Observable<StationGroup> {
    return this.http.put<StationGroup>(`${this.groupsUrl}/${id}`, group);
  }

  deleteStationGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${this.groupsUrl}/${id}`);
  }

  reactivateStationGroup(id: string): Observable<StationGroup> {
    return this.http.patch<StationGroup>(`${this.groupsUrl}/${id}/reactivate`, {});
  }

  getActiveStationGroups(): Observable<StationGroup[]> {
    return this.http.get<StationGroup[]>(`${this.groupsUrl}/active`);
  }

  // Utility methods for filtering and display
  getStationDisplayName(station: Station): string {
    if (station.fullNameWithGroup) {
      return station.fullNameWithGroup;
    }
    return station.stationGroup ? `${station.name} (${station.stationGroup.name})` : station.name;
  }

  getStationTypeDisplayName(stationType: string): string {
    const typeNames = {
      'grouped': 'Station Groupée',
      'independent': 'Station Indépendante'
    };
    return typeNames[stationType as keyof typeof typeNames] || stationType;
  }

  getStationStatusClass(isActive: boolean): string {
    return isActive 
      ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
      : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800';
  }
}