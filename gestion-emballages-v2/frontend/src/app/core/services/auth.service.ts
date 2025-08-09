import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { NotificationService } from './notification.service';
import { User, UserRole } from '../models/user.model';
import { LoginRequest, AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  // Reactive state
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Computed properties using signals
  private userSignal = signal<User | null>(null);
  public user = computed(() => this.userSignal());
  public isAuthenticated = computed(() => !!this.userSignal());
  public userRole = computed(() => this.userSignal()?.role);
  public isAdmin = computed(() => this.userSignal()?.role === UserRole.ADMIN);
  public isManager = computed(() => this.userSignal()?.role === UserRole.MANAGER);
  public isHandler = computed(() => this.userSignal()?.role === UserRole.HANDLER);
  public isStation = computed(() => this.userSignal()?.role === UserRole.STATION);
  public isSupplier = computed(() => this.userSignal()?.role === UserRole.SUPPLIER);

  private baseUrl = `${environment.apiUrl}/auth`;

  initializeAuth(): void {
    const token = this.getToken();
    const user = this.getStoredUser();

    if (token && user) {
      this.setCurrentUser(user);
      // Don't validate token on every page load - only validate if needed
      // This prevents the HTTP call that causes flickering
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.setAuthData(response.accessToken, response.user);
          this.router.navigate(['/dashboard']);
          this.notificationService.showSuccess('Connexion réussie');
        }),
        catchError(error => {
          this.notificationService.showError('Identifiants incorrects');
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
    this.notificationService.showInfo('Vous avez été déconnecté');
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh`, {})
      .pipe(
        tap(response => {
          this.setAuthData(response.accessToken, response.user);
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/profile`)
      .pipe(
        tap(user => this.setCurrentUser(user))
      );
  }

  private validateTokenAndRedirect(): void {
    this.getProfile().subscribe({
      next: () => {
        // Token is valid, user is already set
        if (this.router.url === '/auth/login') {
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        // Token is invalid
        this.logout();
      }
    });
  }

  private setAuthData(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.setCurrentUser(user);
  }

  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    this.userSignal.set(user);
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.userSignal.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  // Signal-based current user accessor
  currentUser(): User | null {
    return this.userSignal();
  }

  // Role-based access methods
  canAccessArticleManagement(): boolean {
    const role = this.userRole();
    return role === UserRole.ADMIN || role === UserRole.MANAGER || role === UserRole.HANDLER;
  }

  canAccessProductManagement(): boolean {
    const role = this.userRole();
    return role === UserRole.ADMIN || role === UserRole.MANAGER || role === UserRole.HANDLER;
  }

  canAccessUserManagement(): boolean {
    const role = this.userRole();
    return role === UserRole.ADMIN || role === UserRole.MANAGER || role === UserRole.HANDLER;
  }

  canAccessStationManagement(): boolean {
    const role = this.userRole();
    return role === UserRole.ADMIN || role === UserRole.MANAGER || role === UserRole.HANDLER;
  }

  canAccessSupplierManagement(): boolean {
    const role = this.userRole();
    return role === UserRole.ADMIN || role === UserRole.MANAGER || role === UserRole.HANDLER;
  }

  canAccessOrderManagement(): boolean {
    const role = this.userRole();
    return role === UserRole.ADMIN || role === UserRole.MANAGER || role === UserRole.HANDLER || role === UserRole.STATION;
  }

  canManageOrders(): boolean {
    return this.isAuthenticated();
  }

  canViewFinancialData(): boolean {
    const role = this.userRole();
    return role === UserRole.ADMIN || role === UserRole.MANAGER || role === UserRole.HANDLER;
  }

  resetPassword(token: string, password: string): Observable<{ message: string }> {
    const url = `${environment.apiUrl}/users/reset-password`;
    return this.http.post<{ message: string }>(url, { token, password });
  }
}