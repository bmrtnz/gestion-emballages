import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Station, StationFilters } from '../../../core/models/station.model';
import { StationService } from '../../../core/services/station.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-station-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Gestion des Stations</h1>
        <button 
          *ngIf="canCreateStation()"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          [routerLink]="['/stations/nouvelle']">
          Nouvelle Station
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="space-y-4">
        <div class="flex items-center space-x-4">
          <button 
            (click)="showFilters.set(!showFilters())"
            class="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <span>Filtres</span>
            <span *ngIf="activeFiltersCount() > 0" 
                  class="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {{ activeFiltersCount() }}
            </span>
          </button>
          
          <div class="flex-1 relative">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="onSearchChange()"
              placeholder="Rechercher par nom, ville, code postal..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Filter Panel -->
        <div *ngIf="showFilters()" class="p-4 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select 
                [(ngModel)]="filters.status"
                (change)="applyFilters()"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">Tout</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>
          
          <div class="flex justify-end">
            <button 
              (click)="clearFilters()"
              class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600">Chargement...</p>
      </div>

      <!-- Desktop Table -->
      <div *ngIf="!loading()" class="hidden md:block bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  (click)="toggleSort('nom')">
                Nom
                <svg *ngIf="filters.sortBy === 'nom'" class="inline w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path *ngIf="filters.sortOrder === 'ASC'" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                  <path *ngIf="filters.sortOrder === 'DESC'" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"/>
                </svg>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let station of stations()" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ station.nom }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ station.adresse }}</div>
                <div class="text-sm text-gray-500">{{ station.codePostal }} {{ station.ville }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ station.contact }}</div>
                <div class="text-sm text-gray-500">{{ station.email }}</div>
                <div class="text-sm text-gray-500">{{ station.telephone }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [class]="getStatusBadgeClass(station.isActive)">
                  {{ station.isActive ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button 
                    [routerLink]="['/stations', station.id]"
                    class="text-blue-600 hover:text-blue-900">
                    Voir
                  </button>
                  <button 
                    *ngIf="canEditStation()"
                    [routerLink]="['/stations', station.id, 'modifier']"
                    class="text-green-600 hover:text-green-900">
                    Modifier
                  </button>
                  <button 
                    *ngIf="canToggleStatus()"
                    (click)="toggleStatus(station)"
                    [class]="station.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'">
                    {{ station.isActive ? 'Désactiver' : 'Activer' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div *ngIf="!loading()" class="md:hidden space-y-4">
        <div *ngFor="let station of stations()" 
             class="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="font-medium text-gray-900">{{ station.nom }}</h3>
              <p class="text-sm text-gray-500">{{ station.ville }}</p>
            </div>
            <span [class]="getStatusBadgeClass(station.isActive)">
              {{ station.isActive ? 'Actif' : 'Inactif' }}
            </span>
          </div>
          
          <div class="space-y-2 text-sm">
            <div><span class="font-medium">Adresse:</span> {{ station.adresse }}</div>
            <div><span class="font-medium">Code postal:</span> {{ station.codePostal }}</div>
            <div *ngIf="station.contact"><span class="font-medium">Contact:</span> {{ station.contact }}</div>
            <div *ngIf="station.email"><span class="font-medium">Email:</span> {{ station.email }}</div>
            <div *ngIf="station.telephone"><span class="font-medium">Téléphone:</span> {{ station.telephone }}</div>
          </div>
          
          <div class="flex items-center justify-end space-x-3 mt-4 pt-3 border-t border-gray-200">
            <button 
              [routerLink]="['/stations', station.id]"
              class="text-blue-600 hover:text-blue-900 text-sm">
              Voir
            </button>
            <button 
              *ngIf="canEditStation()"
              [routerLink]="['/stations', station.id, 'modifier']"
              class="text-green-600 hover:text-green-900 text-sm">
              Modifier
            </button>
            <button 
              *ngIf="canToggleStatus()"
              (click)="toggleStatus(station)"
              [class]="station.isActive ? 'text-red-600 hover:text-red-900 text-sm' : 'text-green-600 hover:text-green-900 text-sm'">
              {{ station.isActive ? 'Désactiver' : 'Activer' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div *ngIf="!loading() && totalPages() > 1" class="flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Affichage de {{ ((currentPage() - 1) * itemsPerPage()) + 1 }} à 
          {{ Math.min(currentPage() * itemsPerPage(), totalItems()) }} sur {{ totalItems() }} résultats
        </div>
        
        <div class="flex items-center space-x-2">
          <button 
            [disabled]="currentPage() === 1"
            (click)="goToPage(currentPage() - 1)"
            class="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
            Précédent
          </button>
          
          <div class="flex space-x-1">
            <button *ngFor="let page of getVisiblePages()" 
                    (click)="goToPage(page)"
                    [class]="page === currentPage() ? 
                      'px-3 py-2 text-sm bg-blue-600 text-white rounded-lg' : 
                      'px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50'">
              {{ page }}
            </button>
          </div>
          
          <button 
            [disabled]="currentPage() === totalPages()"
            (click)="goToPage(currentPage() + 1)"
            class="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
            Suivant
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && stations().length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-4 0H3m2 0h3M9 7h6m-6 4h6m-6 4h6"/>
        </svg>
        <p class="mt-4 text-gray-500">Aucune station trouvée</p>
        <button 
          *ngIf="canCreateStation()"
          [routerLink]="['/stations/nouvelle']"
          class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Créer la première station
        </button>
      </div>
    </div>
  `
})
export class StationListComponent implements OnInit {
  // Signals
  stations = signal<Station[]>([]);
  loading = signal(false);
  showFilters = signal(false);
  currentPage = signal(1);
  totalPages = signal(0);
  totalItems = signal(0);
  itemsPerPage = signal(10);

  // Filter state
  searchQuery = '';
  filters: StationFilters = {
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'nom',
    sortOrder: 'ASC',
    status: ''
  };

  // Computed
  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.filters.status) count++;
    return count;
  });

  private searchTimeout: any;

  // Expose Math to template
  Math = Math;

  constructor(
    private stationService: StationService,
    private authService: AuthService,
    private loadingService: LoadingService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadStations();
  }

  async loadStations() {
    this.loading.set(true);
    try {
      const response = await this.stationService.getStations(this.filters);
      this.stations.set(response.data);
      this.totalPages.set(response.totalPages);
      this.totalItems.set(response.total);
      this.currentPage.set(response.page);
    } catch (error) {
      this.toastService.error('Erreur lors du chargement des stations');
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
      this.loadStations();
    }, 300);
  }

  applyFilters() {
    this.filters.page = 1;
    this.loadStations();
  }

  clearFilters() {
    this.searchQuery = '';
    this.filters = {
      page: 1,
      limit: 10,
      search: '',
      sortBy: 'nom',
      sortOrder: 'ASC',
      status: ''
    };
    this.loadStations();
  }

  toggleSort(field: string) {
    if (this.filters.sortBy === field) {
      this.filters.sortOrder = this.filters.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.filters.sortBy = field;
      this.filters.sortOrder = 'ASC';
    }
    this.loadStations();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.filters.page = page;
      this.loadStations();
    }
  }

  getVisiblePages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push(-1, total);
      } else if (current >= total - 3) {
        pages.push(1, -1);
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1, -1);
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push(-1, total);
      }
    }

    return pages;
  }

  async toggleStatus(station: Station) {
    try {
      if (station.isActive) {
        await this.stationService.deactivateStation(station.id);
        this.toastService.success('Station désactivée avec succès');
      } else {
        await this.stationService.reactivateStation(station.id);
        this.toastService.success('Station réactivée avec succès');
      }
      this.loadStations();
    } catch (error) {
      this.toastService.error('Erreur lors de la modification du statut');
    }
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive 
      ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
      : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800';
  }

  // Permission methods
  canCreateStation(): boolean {
    const user = this.authService.currentUser();
    return user?.role === 'Manager' || user?.role === 'Gestionnaire';
  }

  canEditStation(): boolean {
    const user = this.authService.currentUser();
    return user?.role === 'Manager' || user?.role === 'Gestionnaire';
  }

  canToggleStatus(): boolean {
    const user = this.authService.currentUser();
    return user?.role === 'Manager' || user?.role === 'Gestionnaire';
  }
}