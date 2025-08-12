import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonComponent } from '@shared/components/ui/button.component';
import { ToggleButtonComponent } from '@shared/components/ui/toggle-button.component';

import { Platform } from '../../../core/models/platform.model';
import { PlatformService } from '../../../core/services/platform.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserRole } from '../../../core/models/user.model';

interface PlatformFilters {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  status: string;
  specialties: string;
}

@Component({
  selector: 'app-platform-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule, ButtonComponent, ToggleButtonComponent],
  template: `
    <div class="space-y-6">

      <!-- Search, Filters and Add Button Row -->
      <div class="flex items-start gap-4 mb-6">
        <!-- Filter Panel (Left side) -->
        <div class="flex-1 bg-gray-100 rounded-lg p-4 border border-gray-200">
          
          <!-- Search Bar -->
          <div class="flex items-center space-x-4">
            <ui-toggle-button
              label="Filtres"
              [useCustomIcon]="true"
              [isToggled]="showFilters()"
              [badgeCount]="activeFiltersCount()"
              variant="outline"
              size="md"
              (toggle)="showFilters.set($event)">
              <svg slot="icon" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.586a1 1 0 0 1-.293.707l-6.414 6.414a1 1 0 0 0-.293.707V17l-4 4v-6.586a1 1 0 0 0-.293-.707L3.293 7.207A1 1 0 0 1 3 6.5V4Z"/>
              </svg>
            </ui-toggle-button>
            
            <div class="flex-1 relative">
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (input)="onSearchChange()"
                class="form-input pl-10"
                placeholder="Rechercher par nom, type, spécialité...">
            </div>

            <!-- Reset Filters Button -->
            <ui-button
              type="button"
              variant="outline"
              size="md"
              (click)="clearFilters()">
              Réinitialiser les filtres
            </ui-button>
          </div>

          <!-- Filters Panel -->
          <div *ngIf="showFilters()" class="border-t pt-4 mt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <!-- Status Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select [(ngModel)]="filters.status" (change)="applyFilters()" class="form-select">
                  <option value="">Tout</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>

              <!-- Specialty Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Spécialité</label>
                <select [(ngModel)]="filters.specialties" (change)="applyFilters()" class="form-select">
                  <option value="">Toutes</option>
                  <option value="Distribution">Distribution</option>
                  <option value="Logistique">Logistique</option>
                  <option value="Stockage">Stockage</option>
                  <option value="Cross-docking">Cross-docking</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Platform Button (Right side) - Fixed position aligned with search bar -->
        <div class="flex-shrink-0 pt-4">
          <ui-button
            *ngIf="canCreatePlatform()"
            [routerLink]="['/platforms/nouveau']"
            variant="primary"
            size="md">
            Nouvelle Plateforme
          </ui-button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p class="mt-2 text-gray-600">Chargement...</p>
        </div>
      </div>

      <!-- Main Content -->
      <div *ngIf="!loading()" class="overflow-hidden">
        
        <!-- Pagination Controls -->
        <div *ngIf="platforms().length > 0" 
             class="flex items-center justify-between border-b border-gray-200 px-6 py-2">
          
          <!-- Mobile pagination (Previous/Next only) -->
          <div class="flex flex-1 justify-between sm:hidden">
            <button
              [disabled]="currentPage() === 1 || totalPages() <= 1"
              (click)="goToPage(currentPage() - 1)"
              class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Précédent
            </button>
            <button
              [disabled]="currentPage() === totalPages() || totalPages() <= 1"
              (click)="goToPage(currentPage() + 1)"
              class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Suivant
            </button>
          </div>
          
          <!-- Desktop pagination (Full controls) -->
          <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p class="text-xs text-gray-700">
                Affichage de {{ getResultStart() }} à {{ getResultEnd() }} sur {{ totalItems() }} résultats
              </p>
            </div>
            
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <label class="text-xs text-gray-700">Afficher:</label>
                <select
                  [value]="itemsPerPage()"
                  (change)="changeItemsPerPage($event)"
                  class="border border-gray-300 rounded px-2 py-0.5 text-xs bg-white w-14 focus:ring-1 focus:ring-primary-500 focus:border-primary-500">
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <span class="text-xs text-gray-700">par page</span>
              </div>
              
              <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <!-- Previous Page -->
                <button
                  [disabled]="currentPage() === 1 || totalPages() <= 1"
                  (click)="goToPage(currentPage() - 1)"
                  class="relative inline-flex items-center rounded-l-md px-2 py-0.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a1 1 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                  </svg>
                </button>
                
                <!-- Page Numbers -->
                <button
                  *ngFor="let page of getVisiblePages()"
                  (click)="page > 0 ? goToPage(page) : null"
                  [disabled]="page < 0 || totalPages() <= 1"
                  [class]="getPageButtonClass(page)">
                  {{ page > 0 ? page : '...' }}
                </button>
                
                <!-- Next Page -->
                <button
                  [disabled]="currentPage() === totalPages() || totalPages() <= 1"
                  (click)="goToPage(currentPage() + 1)"
                  class="relative inline-flex items-center rounded-r-md px-2 py-0.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
        
        <!-- Desktop Table -->
        <div class="hidden md:block">
          <div class="overflow-hidden rounded-lg border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-100">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plateforme
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spécialités
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let platform of platforms()" class="hover:bg-gray-50">
                
                <!-- Platform Name -->
                <td class="px-6 py-2">
                  <div class="text-sm font-medium text-gray-900">{{ platform.name }}</div>
                </td>

                <!-- Type -->
                <td class="px-6 py-2">
                  <div class="text-sm text-gray-900">{{ platform.type || '-' }}</div>
                </td>

                <!-- Specialties -->
                <td class="px-6 py-2">
                  <div class="flex flex-wrap gap-1">
                    <span *ngFor="let specialty of getSpecialtiesArray(platform)" 
                          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ specialty }}
                    </span>
                    <span *ngIf="getSpecialtiesArray(platform).length === 0" class="text-sm text-gray-500">-</span>
                  </div>
                </td>

                <!-- Status -->
                <td class="px-6 py-2">
                  <span [class]="getStatusClass(platform.isActive)">
                    {{ platform.isActive ? 'Actif' : 'Inactif' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-6 py-2 text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      [routerLink]="['/platforms', platform.id]"
                      class="text-gray-600 hover:text-gray-900"
                      title="Voir">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      *ngIf="canEditPlatform()"
                      [routerLink]="['/platforms', platform.id, 'modifier']"
                      class="text-gray-600 hover:text-gray-900"
                      title="Modifier">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      *ngIf="canToggleStatus()"
                      (click)="toggleStatus(platform)"
                      [class]="platform.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'"
                      [title]="platform.isActive ? 'Désactiver' : 'Activer'">
                      <lucide-icon *ngIf="platform.isActive" name="square-pause-icon" class="h-4 w-4"></lucide-icon>
                      <lucide-icon *ngIf="!platform.isActive" name="square-play-icon" class="h-4 w-4"></lucide-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>

        <!-- Mobile Cards -->
        <div class="md:hidden space-y-4 p-4">
          <div *ngFor="let platform of platforms()" 
               class="border border-gray-200 rounded-lg p-4 space-y-3">
            
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="text-sm font-medium text-gray-900">{{ platform.name }}</h3>
              </div>
              <span [class]="getStatusClass(platform.isActive)">
                {{ platform.isActive ? 'Actif' : 'Inactif' }}
              </span>
            </div>

            <div class="grid grid-cols-1 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Type:</span>
                <span class="ml-1 text-gray-900">{{ platform.type || '-' }}</span>
              </div>
            </div>

            <div *ngIf="getSpecialtiesArray(platform).length > 0" class="text-sm">
              <span class="text-gray-500">Spécialités:</span>
              <div class="flex flex-wrap gap-1 mt-1">
                <span *ngFor="let specialty of getSpecialtiesArray(platform)" 
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ specialty }}
                </span>
              </div>
            </div>

            <div class="pt-3 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                [routerLink]="['/platforms', platform.id]"
                class="text-blue-600 hover:text-blue-900 text-sm">
                Voir
              </button>
              <button
                type="button"
                *ngIf="canEditPlatform()"
                [routerLink]="['/platforms', platform.id, 'modifier']"
                class="text-green-600 hover:text-green-900 text-sm">
                Modifier
              </button>
              <button
                type="button"
                *ngIf="canToggleStatus()"
                (click)="toggleStatus(platform)"
                [class]="platform.isActive ? 'text-orange-600 hover:text-orange-900 text-sm' : 'text-green-600 hover:text-green-900 text-sm'">
                {{ platform.isActive ? 'Désactiver' : 'Activer' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="platforms().length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-4 0H3m2 0h3M9 7h6m-6 4h6m-6 4h6"/>
          </svg>
          <p class="mt-4 text-gray-500">Aucune plateforme trouvée</p>
          <ui-button 
            *ngIf="canCreatePlatform()"
            [routerLink]="['/platforms/nouveau']"
            variant="primary"
            size="md"
            class="mt-4">
            Créer la première plateforme
          </ui-button>
        </div>
      </div>
    </div>
  `
})
export class PlatformListComponent implements OnInit {
  // Signals
  platforms = signal<Platform[]>([]);
  loading = signal(false);
  showFilters = signal(false);
  currentPage = signal(1);
  totalPages = signal(0);
  totalItems = signal(0);
  itemsPerPage = signal(10);

  // Filter state
  searchQuery = '';
  filters: PlatformFilters = {
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'name',
    sortOrder: 'ASC',
    status: '',
    specialties: ''
  };

  // Computed
  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.filters.status) count++;
    if (this.filters.specialties) count++;
    return count;
  });

  private searchTimeout: any;

  // Expose Math to template
  Math = Math;

  constructor(
    private platformService: PlatformService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadPlatforms();
  }

  // Helper method to ensure specialties is always an array
  getSpecialtiesArray(platform: Platform): string[] {
    if (!platform.specialties) return [];
    if (Array.isArray(platform.specialties)) return platform.specialties;
    
    // Handle case where specialties might be a string (backward compatibility)
    const specialtiesValue = platform.specialties as any;
    if (typeof specialtiesValue === 'string') {
      // Handle string that looks like a JSON array or comma-separated values
      try {
        const parsed = JSON.parse(specialtiesValue);
        return Array.isArray(parsed) ? parsed : [specialtiesValue];
      } catch {
        // If not valid JSON, split by comma or return as single item
        return specialtiesValue.includes(',') 
          ? specialtiesValue.split(',').map((s: string) => s.trim())
          : [specialtiesValue];
      }
    }
    
    return [];
  }

  async loadPlatforms() {
    this.loading.set(true);
    try {
      const response = await this.platformService.getAll(this.filters).toPromise();
      if (response) {
        this.platforms.set(response.data);
        this.totalPages.set(response.totalPages);
        this.totalItems.set(response.total);
        this.currentPage.set(response.page);
      }
    } catch (error) {
      this.toastService.error('Erreur', 'Erreur lors du chargement des plateformes');
    } finally {
      this.loading.set(false);
    }
  }

  onSearchChange() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.filters.search = this.searchQuery;
      this.filters.page = 1;
      this.loadPlatforms();
    }, 300);
  }

  applyFilters() {
    this.filters.page = 1;
    this.loadPlatforms();
  }

  clearFilters() {
    this.searchQuery = '';
    this.filters = {
      page: 1,
      limit: 10,
      search: '',
      sortBy: 'name',
      sortOrder: 'ASC',
      status: '',
      specialties: ''
    };
    this.showFilters.set(false);
    this.loadPlatforms();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.filters.page = page;
      this.currentPage.set(page);
      this.loadPlatforms();
    }
  }

  changeItemsPerPage(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage.set(parseInt(target.value));
    this.filters.limit = parseInt(target.value);
    this.filters.page = 1;
    this.loadPlatforms();
  }

  getVisiblePages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const maxVisible = 5;

    // Always show at least page 1
    if (total === 0) {
      return [1];
    }

    if (total <= maxVisible + 2) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= Math.min(maxVisible, total); i++) {
          pages.push(i);
        }
        if (total > maxVisible) {
          pages.push(-1); // Ellipsis
          pages.push(total);
        }
      } else if (current >= total - 2) {
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = Math.max(total - maxVisible + 1, 1); i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(total);
      }
    }

    return pages;
  }

  getPageButtonClass(page: number): string {
    if (page < 0) {
      return 'relative inline-flex items-center px-2 py-0.5 text-gray-400 ring-1 ring-inset ring-gray-300 cursor-default';
    }
    if (page === this.currentPage()) {
      return 'relative z-10 inline-flex items-center bg-primary-600 px-2 py-0.5 text-xs font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600';
    }
    return 'relative inline-flex items-center px-2 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0';
  }

  getResultStart(): number {
    return (this.currentPage() - 1) * this.itemsPerPage() + 1;
  }

  getResultEnd(): number {
    return Math.min(this.currentPage() * this.itemsPerPage(), this.totalItems());
  }

  async toggleStatus(platform: Platform) {
    try {
      if (platform.isActive) {
        await this.platformService.delete(platform.id).toPromise();
        this.toastService.success('Succès', 'Plateforme désactivée avec succès');
      } else {
        // For reactivation, you might need to create a reactivate method in the service
        this.toastService.info('Information', 'Fonctionnalité de réactivation à implémenter');
      }
      this.loadPlatforms();
    } catch (error) {
      this.toastService.error('Erreur', 'Erreur lors de la modification du statut');
    }
  }

  getStatusClass(isActive: boolean): string {
    return isActive 
      ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
      : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800';
  }

  // Permission methods
  canCreatePlatform(): boolean {
    const user = this.authService.currentUser();
    return user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER || user?.role === UserRole.HANDLER;
  }

  canEditPlatform(): boolean {
    const user = this.authService.currentUser();
    return user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER || user?.role === UserRole.HANDLER;
  }

  canToggleStatus(): boolean {
    const user = this.authService.currentUser();
    return user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER || user?.role === UserRole.HANDLER;
  }
}