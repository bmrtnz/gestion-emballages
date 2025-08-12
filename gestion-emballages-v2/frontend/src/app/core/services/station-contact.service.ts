import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StationContact } from '../models/station.model';
import { environment } from '../../../environments/environment';

export interface UpdateStationContactRequest {
  name: string;
  phone?: string;
  email?: string;
  position?: string;
  isPrimary?: boolean;
}

export interface CreateStationContactRequest extends UpdateStationContactRequest {
  stationId: string;
}

@Injectable({
  providedIn: 'root'
})
export class StationContactService {
  private readonly baseUrl = `${environment.apiUrl}/station-contacts`;

  constructor(private http: HttpClient) {}

  updateContact(contactId: string, contact: UpdateStationContactRequest): Observable<StationContact> {
    return this.http.patch<StationContact>(`${this.baseUrl}/${contactId}`, contact);
  }

  createContact(contact: CreateStationContactRequest): Observable<StationContact> {
    return this.http.post<StationContact>(`${this.baseUrl}`, contact);
  }

  deleteContact(contactId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${contactId}`);
  }

  getContactsByStation(stationId: string): Observable<StationContact[]> {
    return this.http.get<StationContact[]>(`${this.baseUrl}/station/${stationId}`);
  }

  getContact(contactId: string): Observable<StationContact> {
    return this.http.get<StationContact>(`${this.baseUrl}/${contactId}`);
  }

  setPrimaryContact(contactId: string): Observable<StationContact> {
    return this.http.patch<StationContact>(`${this.baseUrl}/${contactId}/set-primary`, {});
  }

  getPrimaryContact(stationId: string): Observable<StationContact | null> {
    return this.http.get<StationContact | null>(`${this.baseUrl}/station/${stationId}/primary`);
  }
}