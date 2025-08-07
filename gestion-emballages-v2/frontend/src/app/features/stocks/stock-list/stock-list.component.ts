import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { StockService } from '@core/services/stock.service';
import { StockFilters } from '@core/models/stock.model';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { UserRole } from '@core/models/user.model';
import { 
  StockStation, 
  PaginatedStockStationsResponse,
  StockStatus,
  StockAnalytics
} from '@core/models/stock.model';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="space-y-6">
      
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Gestion des Stocks</h1>
          <p class="text-gray-600">Suivi et gestion des niveaux de stock</p>
        </div>
        
        <div class="flex space-x-2">
          <button
            type="button"
            class="btn-outline"
            (click)="refreshAnalytics()">
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualiser
          </button>
          
          <button
            *ngIf="authService.canAccessOrderManagement()"
            type="button"
            class="btn-primary"
            (click)="openAddStockModal()">
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un stock
          </button>
        </div>
      </div>

      <!-- Stock Analytics Dashboard -->
      <div *ngIf="analytics()" class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white p-4 rounded-lg shadow-sm">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Articles</p>
              <p class="text-2xl font-semibold text-gray-900">{{ analytics()?.totalArticles || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg shadow-sm">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <svg class="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Stock Faible</p>
              <p class="text-2xl font-semibold text-gray-900">{{ analytics()?.lowStockItems || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg shadow-sm">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Stock Critique</p>
              <p class="text-2xl font-semibold text-gray-900">{{ analytics()?.criticalStockItems || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg shadow-sm">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Rupture Stock</p>
              <p class="text-2xl font-semibold text-gray-900">{{ analytics()?.outOfStockItems || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <form [formGroup]="searchForm" class="space-y-4">
          
          <!-- Search Bar -->
          <div class="flex items-center space-x-4">
            <button
              type="button"
              class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              (click)="showFilters.set(!showFilters())">
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filtres
              <span *ngIf="activeFiltersCount() > 0" 
                    class="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {{ activeFiltersCount() }}
              </span>
            </button>
            
            <div class="flex-1 relative">
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                formControlName="search"
                class="form-input pl-10"
                placeholder="Rechercher par article, station..."
                (input)="onSearchChange()">
            </div>
          </div>

          <!-- Filters Panel -->
          <div *ngIf="showFilters()" class="border-t pt-4 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              <!-- Stock Level Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Niveau de stock</label>
                <select formControlName="stockLevel" class="form-select" (change)="onFiltersChange()">
                  <option value="">Tous les niveaux</option>
                  <option value="low">Stock faible</option>
                  <option value="critical">Stock critique</option>
                  <option value="normal">Stock normal</option>
                </select>
              </div>

              <!-- Sort By -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
                <select formControlName="sortBy" class="form-select" (change)="onFiltersChange()">
                  <option value="derniereMiseAJour">Dernière MàJ</option>
                  <option value="quantiteActuelle">Quantité</option>
                  <option value="article.designation">Article</option>
                  <option value="station.nom">Station</option>
                </select>
              </div>

              <!-- Sort Order -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
                <select formControlName="sortOrder" class="form-select" (change)="onFiltersChange()">
                  <option value="DESC">Décroissant</option>
                  <option value="ASC">Croissant</option>
                </select>
              </div>

              <!-- Quick Filters -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Filtres rapides</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    [class]="getQuickFilterClass('alerts')"
                    (click)="toggleQuickFilter('alerts')">
                    Alertes
                  </button>
                  <button
                    type="button"
                    [class]="getQuickFilterClass('outOfStock')"
                    (click)="toggleQuickFilter('outOfStock')">
                    Ruptures
                  </button>
                </div>
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="button"
                class="btn-outline"
                (click)="clearFilters()">
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex justify-center py-12">
        <app-loading-spinner size="lg" message="Chargement des stocks..."></app-loading-spinner>
      </div>

      <!-- Stock Table -->
      <div *ngIf="!loading()" class="bg-white rounded-lg shadow-sm overflow-hidden">
        
        <!-- Desktop Table -->
        <div class="hidden md:block">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Station
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seuils
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière MàJ
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let stock of stocks()" class="hover:bg-gray-50">
                
                <!-- Article Info -->
                <td class="px-6 py-4">
                  <div>
                    <div class="font-medium text-gray-900">{{ stock.article.designation }}</div>
                    <div class="text-sm text-gray-500">{{ stock.article.codeArticle }}</div>
                  </div>
                </td>

                <!-- Station -->
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">{{ stock.station.nom }}</div>
                </td>

                <!-- Quantity -->
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ stockService.formatQuantity(stock.quantiteActuelle) }}
                  </div>
                </td>

                <!-- Thresholds -->
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">
                    <div *ngIf="stock.seuilAlerte" class="text-yellow-600">
                      Alerte: {{ stockService.formatQuantity(stock.seuilAlerte) }}
                    </div>
                    <div *ngIf="stock.seuilCritique" class="text-red-600">
                      Critique: {{ stockService.formatQuantity(stock.seuilCritique) }}
                    </div>
                    <div *ngIf="!stock.seuilAlerte && !stock.seuilCritique" class="text-gray-400">
                      Non défini
                    </div>
                  </div>
                </td>

                <!-- Status -->
                <td class="px-6 py-4">
                  <span [class]="stockService.getStockStatusClass(stockService.getStockStatus(stock))">
                    {{ stockService.getStockStatusLabel(stockService.getStockStatus(stock)) }}
                  </span>
                </td>

                <!-- Last Updated -->
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">
                    {{ stockService.formatDate(stock.derniereMiseAJour) }}
                  </div>
                  <div *ngIf="stock.updatedBy" class="text-xs text-gray-500">
                    par {{ stock.updatedBy.fullName }}
                  </div>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      class="text-primary-600 hover:text-primary-900"
                      (click)="viewStock(stock)"
                      title="Voir les détails">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    <button
                      *ngIf="stockService.canAdjustStock(authService.userRole() || '')"
                      type="button"
                      class="text-green-600 hover:text-green-900"
                      (click)="adjustStock(stock)"
                      title="Ajuster stock">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2m3 0V1.5A1.5 1.5 0 0014.5 0h-5A1.5 1.5 0 008 1.5V4m-3 1v16a2 2 0 002 2h8a2 2 0 002-2V5H5z" />
                      </svg>
                    </button>

                    <button
                      *ngIf="stockService.canAdjustStock(authService.userRole() || '')"
                      type="button"
                      class="text-gray-600 hover:text-gray-900"
                      (click)="editStock(stock)"
                      title="Modifier">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button
                      *ngIf="stockService.canDeleteStock(authService.userRole() || '')"
                      type="button"
                      class="text-red-600 hover:text-red-900"
                      (click)="deleteStock(stock)"
                      title="Supprimer">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="md:hidden space-y-4 p-4">
          <div *ngFor="let stock of stocks()" 
               class="border border-gray-200 rounded-lg p-4 space-y-3">
            
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">{{ stock.article.designation }}</h3>
                <p class="text-sm text-gray-500">{{ stock.station.nom }}</p>
              </div>
              <span [class]="stockService.getStockStatusClass(stockService.getStockStatus(stock))">
                {{ stockService.getStockStatusLabel(stockService.getStockStatus(stock)) }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Quantité:</span>
                <span class="ml-1 text-gray-900 font-medium">
                  {{ stockService.formatQuantity(stock.quantiteActuelle) }}
                </span>
              </div>
              <div>
                <span class="text-gray-500">Seuil alerte:</span>
                <span class="ml-1 text-gray-900">
                  {{ stock.seuilAlerte ? stockService.formatQuantity(stock.seuilAlerte) : 'Non défini' }}
                </span>
              </div>
            </div>

            <div class="text-sm">
              <span class="text-gray-500">Dernière MàJ:</span>
              <span class="ml-1 text-gray-900">{{ stockService.formatDate(stock.derniereMiseAJour) }}</span>
            </div>

            <!-- Mobile Actions -->
            <div class="flex justify-end space-x-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                class="text-sm text-primary-600 hover:text-primary-900"
                (click)="viewStock(stock)">
                Voir
              </button>
              <button
                *ngIf="stockService.canAdjustStock(authService.userRole() || '')"
                type="button"
                class="text-sm text-green-600 hover:text-green-900"
                (click)="adjustStock(stock)">
                Ajuster
              </button>
              <button
                *ngIf="stockService.canAdjustStock(authService.userRole() || '')"
                type="button"
                class="text-sm text-gray-600 hover:text-gray-900"
                (click)="editStock(stock)">
                Modifier
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="stocks().length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun stock trouvé</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ searchForm.get('search')?.value ? 'Essayez de modifier vos critères de recherche.' : 'Commencez par ajouter des stocks.' }}
          </p>
        </div>
      </div>

    </div>
  `,
  styles: []
})
export class StockListComponent implements OnInit {
  private fb = inject(FormBuilder);
  public stockService = inject(StockService);
  public authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  // Reactive state
  public loading = signal(false);
  public showFilters = signal(false);
  public stocks = signal<StockStation[]>([]);
  public analytics = signal<StockAnalytics | null>(null);
  public paginatedResponse = signal<PaginatedStockStationsResponse | null>(null);
  public currentPage = signal(1);
  public itemsPerPage = signal(10);
  
  // Quick filters state
  private quickFilters = signal<Set<string>>(new Set());

  // Computed values
  public activeFiltersCount = computed(() => {
    const formValue = this.searchForm.value;
    let count = 0;
    if (formValue.stockLevel) count++;
    if (formValue.sortBy !== 'derniereMiseAJour') count++;
    if (formValue.sortOrder !== 'DESC') count++;
    count += this.quickFilters().size;
    return count;
  });

  // Form
  public searchForm: FormGroup = this.fb.group({
    search: [''],
    stockLevel: [''],
    sortBy: ['derniereMiseAJour'],
    sortOrder: ['DESC']
  });

  private searchTimeout: any;

  ngOnInit() {
    this.loadAnalytics();
    this.loadStocks();
  }

  private loadAnalytics() {
    const stationId = this.authService.userRole() === UserRole.STATION ? this.authService.user()?.entityId : undefined;
    
    this.stockService.getStockAnalytics(stationId).subscribe({
      next: (analytics) => {
        this.analytics.set(analytics);
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
      }
    });
  }

  loadStocks() {
    this.loading.set(true);
    
    const filters: StockFilters = {
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      ...this.searchForm.value
    };

    // Apply quick filters
    if (this.quickFilters().has('alerts')) {
      filters.lowStock = true;
    }
    if (this.quickFilters().has('outOfStock')) {
      filters.criticalStock = true;
    }

    // Apply stock level filter
    if (this.searchForm.get('stockLevel')?.value === 'low') {
      filters.lowStock = true;
    } else if (this.searchForm.get('stockLevel')?.value === 'critical') {
      filters.criticalStock = true;
    }

    this.stockService.getStockStations(filters).subscribe({
      next: (response) => {
        this.stocks.set(response.data);
        this.paginatedResponse.set(response);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading stocks:', error);
        this.loading.set(false);
      }
    });
  }

  onSearchChange() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadStocks();
    }, 300);
  }

  onFiltersChange() {
    this.currentPage.set(1);
    this.loadStocks();
  }

  clearFilters() {
    this.searchForm.patchValue({
      search: '',
      stockLevel: '',
      sortBy: 'derniereMiseAJour',
      sortOrder: 'DESC'
    });
    this.quickFilters.set(new Set());
    this.currentPage.set(1);
    this.loadStocks();
  }

  toggleQuickFilter(filter: string) {
    const current = new Set(this.quickFilters());
    if (current.has(filter)) {
      current.delete(filter);
    } else {
      current.add(filter);
    }
    this.quickFilters.set(current);
    this.currentPage.set(1);
    this.loadStocks();
  }

  getQuickFilterClass(filter: string): string {
    const baseClasses = 'px-3 py-1 text-xs rounded-full border';
    if (this.quickFilters().has(filter)) {
      return `${baseClasses} bg-primary-100 text-primary-800 border-primary-200`;
    }
    return `${baseClasses} bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200`;
  }

  refreshAnalytics() {
    this.loadAnalytics();
    this.loadStocks();
  }

  // Pagination methods
  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadStocks();
  }

  changeItemsPerPage(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage.set(parseInt(target.value));
    this.currentPage.set(1);
    this.loadStocks();
  }

  getVisiblePages(): number[] {
    const totalPages = this.paginatedResponse()?.totalPages || 0;
    const current = this.currentPage();
    const delta = 2;
    const range = [];
    
    for (let i = Math.max(2, current - delta); i <= Math.min(totalPages - 1, current + delta); i++) {
      range.push(i);
    }
    
    if (current - delta > 2) {
      range.unshift(-1);
    }
    if (current + delta < totalPages - 1) {
      range.push(-1);
    }
    
    if (totalPages > 1) {
      range.unshift(1);
      if (totalPages > 1) {
        range.push(totalPages);
      }
    }
    
    return range.filter((v, i, arr) => arr.indexOf(v) === i && v > 0);
  }

  getPageButtonClass(page: number): string {
    const baseClasses = 'relative inline-flex items-center px-4 py-2 text-sm font-semibold';
    if (page === this.currentPage()) {
      return `${baseClasses} z-10 bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600`;
    }
    return `${baseClasses} text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0`;
  }

  getResultStart(): number {
    const response = this.paginatedResponse();
    if (!response) return 0;
    return (response.page - 1) * response.limit + 1;
  }

  getResultEnd(): number {
    const response = this.paginatedResponse();
    if (!response) return 0;
    return Math.min(response.page * response.limit, response.total);
  }

  // Stock actions
  viewStock(stock: StockStation) {
    // TODO: Navigate to stock detail view
  }

  editStock(stock: StockStation) {
    // TODO: Open edit modal or navigate to edit page
  }

  adjustStock(stock: StockStation) {
    const adjustment = prompt('Ajustement de quantité (positif ou négatif):');
    if (adjustment !== null) {
      const adjustmentValue = parseInt(adjustment);
      if (!isNaN(adjustmentValue)) {
        this.stockService.adjustStockStation(stock.id, { 
          ajustement: adjustmentValue,
          raison: 'Ajustement manuel'
        }).subscribe({
          next: () => {
            this.notificationService.showSuccess('Stock ajusté avec succès');
            this.loadStocks();
            this.loadAnalytics();
          },
          error: (error) => {
            console.error('Error adjusting stock:', error);
          }
        });
      }
    }
  }

  openAddStockModal() {
    // TODO: Open add stock modal
  }

  deleteStock(stock: StockStation) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le stock de ${stock.article.designation} ?`)) {
      this.stockService.deleteStockStation(stock.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Stock supprimé avec succès');
          this.loadStocks();
          this.loadAnalytics();
        },
        error: (error) => {
          console.error('Error deleting stock:', error);
        }
      });
    }
  }
}