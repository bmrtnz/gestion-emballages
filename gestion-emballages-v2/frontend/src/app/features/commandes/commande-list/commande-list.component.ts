import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CommandeService } from '@core/services/commande.service';
import { CommandeFilters } from '@core/models/commande.model';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { 
  Commande, 
  OrderStatus, 
  PaginatedCommandesResponse,
  OrderStatusOption
} from '@core/models/commande.model';

@Component({
  selector: 'app-commande-list',
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
          <h1 class="text-2xl font-bold text-gray-900">Commandes</h1>
          <p class="text-gray-600">Gestion des commandes</p>
        </div>
        
        <div class="flex space-x-2">
          <button
            *ngIf="authService.canAccessOrderManagement()"
            type="button"
            class="btn-outline"
            (click)="openCreateGlobalOrderModal()">
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Commande globale
          </button>
          
          <button
            *ngIf="authService.canAccessOrderManagement()"
            type="button"
            class="btn-primary"
            (click)="openCreateOrderModal()">
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle commande
          </button>
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
                placeholder="Rechercher par numéro, station ou fournisseur..."
                (input)="onSearchChange()">
            </div>
          </div>

          <!-- Filters Panel -->
          <div *ngIf="showFilters()" class="border-t pt-4 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              <!-- Status Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select formControlName="status" class="form-select" (change)="onFiltersChange()">
                  <option value="">Tous</option>
                  <option value="active">Actives</option>
                  <option value="inactive">Archivées</option>
                </select>
              </div>

              <!-- Order Status Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">État de commande</label>
                <select formControlName="statut" class="form-select" (change)="onFiltersChange()">
                  <option value="">Tous les états</option>
                  <option *ngFor="let status of orderStatuses()" [value]="status.value">
                    {{ status.label }}
                  </option>
                </select>
              </div>

              <!-- Sort By -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
                <select formControlName="sortBy" class="form-select" (change)="onFiltersChange()">
                  <option value="createdAt">Date de création</option>
                  <option value="numeroCommande">Numéro</option>
                  <option value="montantTotalHt">Montant</option>
                  <option value="statut">Statut</option>
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
        <app-loading-spinner size="lg" message="Chargement des commandes..."></app-loading-spinner>
      </div>

      <!-- Orders Table -->
      <div *ngIf="!loading()" class="bg-white rounded-lg shadow-sm overflow-hidden">
        
        <!-- Desktop Table -->
        <div class="hidden md:block">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commande
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Station
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date création
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let commande of commandes()" class="hover:bg-gray-50">
                
                <!-- Order Info -->
                <td class="px-6 py-4">
                  <div>
                    <div class="font-medium text-gray-900">{{ commande.numeroCommande }}</div>
                    <div *ngIf="commande.commandeGlobale" class="text-sm text-gray-500">
                      Globale: {{ commande.commandeGlobale.referenceGlobale }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ commande.commandeArticles.length }} article(s)
                    </div>
                  </div>
                </td>

                <!-- Station -->
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">{{ commande.station.nom }}</div>
                </td>

                <!-- Supplier -->
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">{{ commande.fournisseur.nom }}</div>
                </td>

                <!-- Amount -->
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 font-medium">
                    {{ commandeService.formatPrice(commande.montantTotalHt) }}
                  </div>
                </td>

                <!-- Status -->
                <td class="px-6 py-4">
                  <span [class]="commandeService.getStatusClass(commande.statut)">
                    {{ commande.statut }}
                  </span>
                </td>

                <!-- Created Date -->
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">
                    {{ commandeService.formatDate(commande.createdAt) }}
                  </div>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      class="text-primary-600 hover:text-primary-900"
                      (click)="viewCommande(commande)"
                      title="Voir les détails">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    <button
                      *ngIf="canUpdateOrder(commande)"
                      type="button"
                      class="text-gray-600 hover:text-gray-900"
                      (click)="editCommande(commande)"
                      title="Modifier">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <div class="relative" *ngIf="getNextStatuses(commande).length > 0">
                      <button
                        type="button"
                        class="text-green-600 hover:text-green-900"
                        (click)="showStatusMenu(commande)"
                        title="Changer statut">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </button>
                    </div>

                    <button
                      *ngIf="canDeleteOrder(commande)"
                      type="button"
                      class="text-red-600 hover:text-red-900"
                      (click)="deleteCommande(commande)"
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
          <div *ngFor="let commande of commandes()" 
               class="border border-gray-200 rounded-lg p-4 space-y-3">
            
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">{{ commande.numeroCommande }}</h3>
                <p class="text-sm text-gray-500">{{ commande.station.nom }}</p>
              </div>
              <span [class]="commandeService.getStatusClass(commande.statut)">
                {{ commande.statut }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Fournisseur:</span>
                <span class="ml-1 text-gray-900">{{ commande.fournisseur.nom }}</span>
              </div>
              <div>
                <span class="text-gray-500">Montant:</span>
                <span class="ml-1 text-gray-900 font-medium">
                  {{ commandeService.formatPrice(commande.montantTotalHt) }}
                </span>
              </div>
            </div>

            <div class="text-sm">
              <span class="text-gray-500">Articles:</span>
              <span class="ml-1 text-gray-900">{{ commande.commandeArticles.length }}</span>
            </div>

            <div class="text-sm">
              <span class="text-gray-500">Créée le:</span>
              <span class="ml-1 text-gray-900">{{ commandeService.formatDate(commande.createdAt) }}</span>
            </div>

            <!-- Mobile Actions -->
            <div class="flex justify-end space-x-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                class="text-sm text-primary-600 hover:text-primary-900"
                (click)="viewCommande(commande)">
                Voir
              </button>
              <button
                *ngIf="canUpdateOrder(commande)"
                type="button"
                class="text-sm text-gray-600 hover:text-gray-900"
                (click)="editCommande(commande)">
                Modifier
              </button>
              <button
                *ngIf="canDeleteOrder(commande)"
                type="button"
                class="text-sm text-red-600 hover:text-red-900"
                (click)="deleteCommande(commande)">
                Supprimer
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="commandes().length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune commande trouvée</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ searchForm.get('search')?.value ? 'Essayez de modifier vos critères de recherche.' : 'Commencez par créer votre première commande.' }}
          </p>
        </div>
      </div>

    </div>
  `,
  styles: []
})
export class CommandeListComponent implements OnInit {
  private fb = inject(FormBuilder);
  public commandeService = inject(CommandeService);
  public authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  // Reactive state
  public loading = signal(false);
  public showFilters = signal(false);
  public commandes = signal<Commande[]>([]);
  public orderStatuses = signal<OrderStatusOption[]>([]);
  public paginatedResponse = signal<PaginatedCommandesResponse | null>(null);
  public currentPage = signal(1);
  public itemsPerPage = signal(10);

  // Computed values
  public activeFiltersCount = computed(() => {
    const formValue = this.searchForm.value;
    let count = 0;
    if (formValue.status) count++;
    if (formValue.statut) count++;
    if (formValue.sortBy !== 'createdAt') count++;
    if (formValue.sortOrder !== 'DESC') count++;
    return count;
  });

  // Form
  public searchForm: FormGroup = this.fb.group({
    search: [''],
    status: [''],
    statut: [''],
    sortBy: ['createdAt'],
    sortOrder: ['DESC']
  });

  private searchTimeout: any;

  ngOnInit() {
    this.loadOrderStatuses();
    this.loadCommandes();
  }

  private loadOrderStatuses() {
    this.commandeService.getOrderStatuses().subscribe({
      next: (response) => {
        this.orderStatuses.set(response.statuses);
      },
      error: (error) => {
        console.error('Error loading order statuses:', error);
      }
    });
  }

  loadCommandes() {
    this.loading.set(true);
    
    const filters: CommandeFilters = {
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      ...this.searchForm.value
    };

    this.commandeService.getCommandes(filters).subscribe({
      next: (response) => {
        this.commandes.set(response.data);
        this.paginatedResponse.set(response);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
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
      this.loadCommandes();
    }, 300);
  }

  onFiltersChange() {
    this.currentPage.set(1);
    this.loadCommandes();
  }

  clearFilters() {
    this.searchForm.patchValue({
      search: '',
      status: '',
      statut: '',
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    });
    this.currentPage.set(1);
    this.loadCommandes();
  }

  // Pagination methods
  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadCommandes();
  }

  changeItemsPerPage(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage.set(parseInt(target.value));
    this.currentPage.set(1);
    this.loadCommandes();
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

  // Order actions
  viewCommande(commande: Commande) {
    // View order functionality
  }

  editCommande(commande: Commande) {
    // Edit order functionality
  }

  openCreateOrderModal() {
    // Create new order functionality
  }

  openCreateGlobalOrderModal() {
    // Create new global order functionality
  }

  deleteCommande(commande: Commande) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la commande ${commande.numeroCommande} ?`)) {
      this.commandeService.deleteCommande(commande.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Commande supprimée avec succès');
          this.loadCommandes();
        },
        error: (error) => {
          console.error('Error deleting order:', error);
        }
      });
    }
  }

  showStatusMenu(commande: Commande) {
    const nextStatuses = this.getNextStatuses(commande);
    if (nextStatuses.length === 1) {
      this.updateOrderStatus(commande, nextStatuses[0]);
    } else {
      // TODO: Implement status selection menu
    }
  }

  updateOrderStatus(commande: Commande, newStatus: OrderStatus) {
    this.commandeService.updateCommandeStatus(commande.id, newStatus).subscribe({
      next: () => {
        this.notificationService.showSuccess(`Statut mis à jour vers "${newStatus}"`);
        this.loadCommandes();
      },
      error: (error) => {
        console.error('Error updating order status:', error);
      }
    });
  }

  // Permission methods
  canUpdateOrder(commande: Commande): boolean {
    const userRole = this.authService.userRole();
    return userRole ? this.commandeService.canUpdateStatus(commande.statut, userRole) : false;
  }

  canDeleteOrder(commande: Commande): boolean {
    const userRole = this.authService.userRole();
    return ['Manager', 'Gestionnaire', 'Station'].includes(userRole || '') && 
           commande.statut === OrderStatus.ENREGISTREE;
  }

  getNextStatuses(commande: Commande): OrderStatus[] {
    const userRole = this.authService.userRole();
    return userRole ? this.commandeService.getNextPossibleStatuses(commande.statut, userRole) : [];
  }
}