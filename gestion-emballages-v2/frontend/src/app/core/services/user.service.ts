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
  entityType?: 'STATION' | 'SUPPLIER' | '';
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

  sendPasswordResetLink(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/password-reset-link`, { email });
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
      [UserRole.HANDLER]: 'Gestionnaire',
      [UserRole.STATION]: 'Station',
      [UserRole.SUPPLIER]: 'Fournisseur'
    };
    return roleNames[role] || role;
  }

  getEntityTypeDisplayName(entityType?: string): string {
    if (!entityType) return '';
    const entityNames = {
      'STATION': 'Station',
      'SUPPLIER': 'Fournisseur'
    };
    return entityNames[entityType as keyof typeof entityNames] || entityType;
  }

  getUserInitials(fullName: string): string {
    if (!fullName) return '?';
    
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  canEditUser(currentUserRole: UserRole, targetUserRole: UserRole): boolean {
    // Admin, Manager, and Gestionnaire can all edit any user independently of its role
    if (currentUserRole === UserRole.ADMIN || 
        currentUserRole === UserRole.MANAGER || 
        currentUserRole === UserRole.HANDLER) {
      return true;
    }
    
    return false;
  }

  canDeleteUser(currentUserRole: UserRole, targetUserRole: UserRole): boolean {
    return this.canEditUser(currentUserRole, targetUserRole);
  }

  getAvailableRoles(currentUserRole: UserRole): UserRole[] {
    // Admin, Manager, and Gestionnaire can filter on all roles
    if (currentUserRole === UserRole.ADMIN || 
        currentUserRole === UserRole.MANAGER || 
        currentUserRole === UserRole.HANDLER) {
      return [UserRole.ADMIN, UserRole.MANAGER, UserRole.HANDLER, UserRole.STATION, UserRole.SUPPLIER];
    }
    
    return [];
  }

  requiresEntity(role: UserRole): boolean {
    return role === UserRole.STATION || role === UserRole.SUPPLIER;
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
    let display = user.fullName;
    
    if (user.role === UserRole.STATION && user.station) {
      display += ` (${user.station.name})`;
    } else if (user.role === UserRole.SUPPLIER && user.supplier) {
      display += ` (${user.supplier.name})`;
    }
    
    return display;
  }
}