import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          
          <!-- Left side: Menu button and Title -->
          <div class="flex items-center">
            <button
              type="button"
              class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              (click)="menuClick.emit()">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <h1 class="ml-4 lg:ml-0 text-xl font-semibold text-gray-900">
              {{ getPageTitle() }}
            </h1>
          </div>

          <!-- Right side: User menu -->
          <div class="flex items-center space-x-4">
            <!-- User info -->
            <div class="hidden md:flex items-center space-x-3">
              <div class="text-right">
                <p class="text-sm font-medium text-gray-900">
                  {{ authService.user()?.fullName }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ getRoleDisplayName(authService.user()?.role) }}
                </p>
              </div>
              
              <!-- User avatar -->
              <div class="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium text-white">
                  {{ getUserInitials() }}
                </span>
              </div>
            </div>

            <!-- Logout button -->
            <button
              type="button"
              class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              (click)="logout()"
              title="Se déconnecter">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent {
  @Output() menuClick = new EventEmitter<void>();

  public authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
  }

  getUserInitials(): string {
    const user = this.authService.user();
    if (!user?.fullName) return '?';
    
    return user.fullName
      .split(' ')
      .map(name => name.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  getRoleDisplayName(role?: UserRole): string {
    const roleNames = {
      [UserRole.MANAGER]: 'Gestionnaire',
      [UserRole.HANDLER]: 'Gestionnaire',
      [UserRole.STATION]: 'Station',
      [UserRole.SUPPLIER]: 'Fournisseur'
    };
    return role ? roleNames[role] : '';
  }

  getPageTitle(): string {
    const url = this.router.url;
    const titleMap: { [key: string]: string } = {
      '/dashboard': 'Tableau de bord',
      '/articles': 'Articles',
      '/users': 'Utilisateurs',
      '/stations': 'Stations',
      '/fournisseurs': 'Fournisseurs',
      '/orders': 'Orders',
      '/shopping-cart': 'Shopping Cart',
      '/stocks': 'Stocks',
      '/transferts': 'Transferts',
      '/previsions': 'Prévisions'
    };

    // Find matching route
    for (const route in titleMap) {
      if (url.startsWith(route)) {
        return titleMap[route];
      }
    }

    return 'Blue Whale Portal';
  }
}