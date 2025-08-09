import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen space-y-6">
      
      <!-- Welcome Header -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          Bienvenue, {{ authService.user()?.fullName }}
        </h1>
        <p class="text-gray-600">
          Vous êtes connecté en tant que {{ getRoleDisplayName() }}
        </p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- Articles -->
        <div *ngIf="canViewArticles()" class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-2 bg-primary-100 rounded-lg">
              <svg class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Articles</p>
              <p class="text-2xl font-semibold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <!-- Commandes -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-2 bg-accent-100 rounded-lg">
              <svg class="h-6 w-6 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m2 0h6a2 2 0 002-2V7a2 2 0 00-2-2h-6m2 0V3a2 2 0 00-2-2H9a2 2 0 00-2 2v2m2 0h2" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Commandes</p>
              <p class="text-2xl font-semibold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <!-- Stocks -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-2 bg-sunshine-100 rounded-lg">
              <svg class="h-6 w-6 text-sunshine-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2h4a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1h2z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Articles en stock</p>
              <p class="text-2xl font-semibold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <!-- Users -->
        <div *ngIf="canViewUsers()" class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="p-2 bg-energy-100 rounded-lg">
              <svg class="h-6 w-6 text-energy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Utilisateurs</p>
              <p class="text-2xl font-semibold text-gray-900">-</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <!-- Station specific actions -->
          <ng-container *ngIf="authService.isStation()">
            <a href="/shopping-cart" 
               class="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200">
              <div class="flex items-center">
                <svg class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 3H3m4 10a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-gray-900">Shopping Cart</h3>
                  <p class="text-xs text-gray-500">Manage your purchases</p>
                </div>
              </div>
            </a>
          </ng-container>

          <!-- Admin/Manager/Handler actions -->
          <ng-container *ngIf="authService.isAdmin() || authService.isManager() || authService.isHandler()">
            <a href="/articles" 
               class="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200">
              <div class="flex items-center">
                <svg class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-gray-900">Gérer les articles</h3>
                  <p class="text-xs text-gray-500">Ajouter/modifier des articles</p>
                </div>
              </div>
            </a>

            <a href="/users" 
               class="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200">
              <div class="flex items-center">
                <svg class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-gray-900">Gérer les utilisateurs</h3>
                  <p class="text-xs text-gray-500">Ajouter/modifier des utilisateurs</p>
                </div>
              </div>
            </a>
          </ng-container>

          <!-- Common actions -->
          <a href="/orders" 
             class="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200">
            <div class="flex items-center">
              <svg class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m2 0h6a2 2 0 002-2V7a2 2 0 00-2-2h-6m2 0V3a2 2 0 00-2-2H9a2 2 0 00-2 2v2m2 0h2" />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-gray-900">Voir les commandes</h3>
                <p class="text-xs text-gray-500">Consulter l'historique</p>
              </div>
            </div>
          </a>

          <a href="/stocks" 
             class="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200">
            <div class="flex items-center">
              <svg class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2h4a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1h2z" />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-gray-900">Consulter les stocks</h3>
                <p class="text-xs text-gray-500">État des inventaires</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent {
  public authService = inject(AuthService);

  getRoleDisplayName(): string {
    const role = this.authService.userRole();
    const roleNames = {
      [UserRole.ADMIN]: 'Administrateur',
      [UserRole.MANAGER]: 'Manager',
      [UserRole.HANDLER]: 'Gestionnaire',
      [UserRole.STATION]: 'Station',
      [UserRole.SUPPLIER]: 'Fournisseur'
    };
    return role ? roleNames[role] : '';
  }

  canViewArticles(): boolean {
    return this.authService.canAccessArticleManagement();
  }

  canViewUsers(): boolean {
    return this.authService.canAccessUserManagement();
  }
}