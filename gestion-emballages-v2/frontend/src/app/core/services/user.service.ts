import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@environments/environment';
import { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest,
  UserRole
} from '../models/user.model';

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: 'active' | 'inactive' | '';
  role?: UserRole | '';
  entiteType?: 'Station' | 'Fournisseur' | '';
}

export interface PaginatedUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/users`;

  // User CRUD operations
  getUsers(filters?: UserFilters): Observable<PaginatedUsersResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof UserFilters];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedUsersResponse>(this.baseUrl, { params });
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  createUser(user: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.baseUrl, user);
  }

  updateUser(id: string, user: UpdateUserRequest): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  reactivateUser(id: string): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}/reactivate`, {});
  }

  // Development-only method
  getDevUsers(): Observable<PaginatedUsersResponse> {
    return this.http.get<PaginatedUsersResponse>(`${this.baseUrl}/dev/list`);
  }

  // Admin-only hard delete methods
  checkDataIntegrity(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}/integrity-check`);
  }

  hardDeleteUser(id: string, options?: { cascadeDelete?: boolean; confirmIntegrityCheck?: boolean }): Observable<any> {
    let params = new HttpParams();
    if (options?.cascadeDelete) {
      params = params.set('cascadeDelete', 'true');
    }
    if (options?.confirmIntegrityCheck) {
      params = params.set('confirmIntegrityCheck', 'true');
    }
    return this.http.delete(`${this.baseUrl}/${id}/hard-delete`, { params });
  }

  // Utility methods
  getRoleDisplayName(role: UserRole): string {
    const roleNames = {
      [UserRole.ADMIN]: 'Admin',
      [UserRole.MANAGER]: 'Manager',
      [UserRole.GESTIONNAIRE]: 'Gestionnaire',
      [UserRole.STATION]: 'Station',
      [UserRole.FOURNISSEUR]: 'Fournisseur'
    };
    return roleNames[role] || role;
  }

  getEntityTypeDisplayName(entityType?: string): string {
    if (!entityType) return '';
    const entityNames = {
      'Station': 'Station',
      'Fournisseur': 'Fournisseur'
    };
    return entityNames[entityType as keyof typeof entityNames] || entityType;
  }

  getUserInitials(nomComplet: string): string {
    if (!nomComplet) return '?';
    
    return nomComplet
      .split(' ')
      .map(name => name.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  canEditUser(currentUserRole: UserRole, targetUserRole: UserRole): boolean {
    // Admin can edit everyone
    if (currentUserRole === UserRole.ADMIN) return true;
    
    // Manager can edit everyone except Admin
    if (currentUserRole === UserRole.MANAGER) {
      return targetUserRole !== UserRole.ADMIN;
    }
    
    // Gestionnaire can edit Station and Fournisseur users, but not Admin/Manager/other Gestionnaires
    if (currentUserRole === UserRole.GESTIONNAIRE) {
      return targetUserRole === UserRole.STATION || targetUserRole === UserRole.FOURNISSEUR;
    }
    
    return false;
  }

  canDeleteUser(currentUserRole: UserRole, targetUserRole: UserRole): boolean {
    return this.canEditUser(currentUserRole, targetUserRole);
  }

  getAvailableRoles(currentUserRole: UserRole): UserRole[] {
    if (currentUserRole === UserRole.ADMIN) {
      return [UserRole.ADMIN, UserRole.MANAGER, UserRole.GESTIONNAIRE, UserRole.STATION, UserRole.FOURNISSEUR];
    }
    
    if (currentUserRole === UserRole.MANAGER) {
      return [UserRole.MANAGER, UserRole.GESTIONNAIRE, UserRole.STATION, UserRole.FOURNISSEUR];
    }
    
    if (currentUserRole === UserRole.GESTIONNAIRE) {
      return [UserRole.GESTIONNAIRE, UserRole.STATION, UserRole.FOURNISSEUR];
    }
    
    return [];
  }

  requiresEntity(role: UserRole): boolean {
    return role === UserRole.STATION || role === UserRole.FOURNISSEUR;
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  formatUserDisplay(user: User): string {
    let display = user.nomComplet;
    
    if (user.role === UserRole.STATION && user.station) {
      display += ` (${user.station.nom})`;
    } else if (user.role === UserRole.FOURNISSEUR && user.fournisseur) {
      display += ` (${user.fournisseur.nom})`;
    }
    
    return display;
  }
}