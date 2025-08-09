import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ProductService, ProductFilters } from '@core/services/product.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { Product, ProductCategory, PaginatedProductsResponse } from '@core/models/product.model';

@Component({
  selector: 'app-product-list',
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
          <h1 class="text-2xl font-bold text-gray-900">Products</h1>
          <p class="text-gray-600">Gestion des produits et emballages</p>
        </div>
        
        <button
          *ngIf="authService.canAccessProductManagement()"
          type="button"
          class="btn-primary"
          (click)="openCreateModal()">
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau produit
        </button>
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
                placeholder="Rechercher par code, description ou fournisseur..."
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
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                </select>
              </div>

              <!-- Category Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select formControlName="category" class="form-select" (change)="onFiltersChange()">
                  <option value="">Toutes les catégories</option>
                  <option *ngFor="let category of categories()" [value]="category">
                    {{ category }}
                  </option>
                </select>
              </div>

              <!-- Sort By -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
                <select formControlName="sortBy" class="form-select" (change)="onFiltersChange()">
                  <option value="description">Description</option>
                  <option value="productCode">Code produit</option>
                  <option value="category">Catégorie</option>
                  <option value="createdAt">Date de création</option>
                </select>
              </div>

              <!-- Sort Order -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
                <select formControlName="sortOrder" class="form-select" (change)="onFiltersChange()">
                  <option value="ASC">Croissant</option>
                  <option value="DESC">Décroissant</option>
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
        <app-loading-spinner size="lg" message="Chargement des produits..."></app-loading-spinner>
      </div>

      <!-- Articles Table -->
      <div *ngIf="!loading()" class="bg-white rounded-lg shadow-sm overflow-hidden">
        
        <!-- Desktop Table -->
        <div class="hidden md:block">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fournisseurs
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
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
              <tr *ngFor="let product of products()" class="hover:bg-gray-50">
                
                <!-- Product Info -->
                <td class="px-6 py-4">
                  <div>
                    <div class="font-medium text-gray-900">{{ product.description }}</div>
                    <div class="text-sm text-gray-500">{{ product.productCode }}</div>
                  </div>
                </td>

                <!-- Category -->
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {{ product.category }}
                  </span>
                </td>

                <!-- Suppliers -->
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">
                    {{ productService.getSuppliersCount(product.productSuppliers) }} fournisseur(s)
                  </div>
                  <div *ngIf="product.productSuppliers.length > 0" class="text-xs text-gray-500">
                    {{ product.productSuppliers[0].supplier?.name }}
                    <span *ngIf="product.productSuppliers.length > 1">
                      +{{ product.productSuppliers.length - 1 }} autre(s)
                    </span>
                  </div>
                </td>

                <!-- Price -->
                <td class="px-6 py-4">
                  <div *ngIf="product.productSuppliers.length > 0" class="text-sm">
                    <div class="text-gray-900">
                      {{ productService.formatPrice(productService.getLowestPrice(product.productSuppliers)!) }}
                    </div>
                    <div *ngIf="productService.getLowestPrice(product.productSuppliers) !== productService.getHighestPrice(product.productSuppliers)" 
                         class="text-xs text-gray-500">
                      à {{ productService.formatPrice(productService.getHighestPrice(product.productSuppliers)!) }}
                    </div>
                  </div>
                  <div *ngIf="product.productSuppliers.length === 0" class="text-sm text-gray-400">
                    Aucun prix
                  </div>
                </td>

                <!-- Status -->
                <td class="px-6 py-4">
                  <span [class]="getStatusClass(product.isActive)">
                    {{ product.isActive ? 'Actif' : 'Inactif' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      class="text-primary-600 hover:text-primary-900"
                      (click)="viewProduct(product)"
                      title="Voir les détails">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    <button
                      *ngIf="authService.canAccessProductManagement()"
                      type="button"
                      class="text-gray-600 hover:text-gray-900"
                      (click)="editProduct(product)"
                      title="Modifier">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button
                      *ngIf="authService.canAccessProductManagement()"
                      type="button"
                      [class]="product.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                      (click)="toggleProductStatus(product)"
                      [title]="product.isActive ? 'Désactiver' : 'Réactiver'">
                      <svg *ngIf="product.isActive" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <svg *ngIf="!product.isActive" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
          <div *ngFor="let product of products()" 
               class="border border-gray-200 rounded-lg p-4 space-y-3">
            
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">{{ product.description }}</h3>
                <p class="text-sm text-gray-500">{{ product.productCode }}</p>
              </div>
              <span [class]="getStatusClass(product.isActive)">
                {{ product.isActive ? 'Actif' : 'Inactif' }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Catégorie:</span>
                <span class="ml-1 text-gray-900">{{ product.category }}</span>
              </div>
              <div>
                <span class="text-gray-500">Fournisseurs:</span>
                <span class="ml-1 text-gray-900">{{ productService.getSuppliersCount(product.productSuppliers) }}</span>
              </div>
            </div>

            <div *ngIf="product.productSuppliers.length > 0" class="text-sm">
              <span class="text-gray-500">Prix:</span>
              <span class="ml-1 text-gray-900">
                {{ productService.formatPrice(productService.getLowestPrice(product.productSuppliers)!) }}
                <span *ngIf="productService.getLowestPrice(product.productSuppliers) !== productService.getHighestPrice(product.productSuppliers)">
                  - {{ productService.formatPrice(productService.getHighestPrice(product.productSuppliers)!) }}
                </span>
              </span>
            </div>

            <!-- Mobile Actions -->
            <div class="flex justify-end space-x-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                class="text-sm text-primary-600 hover:text-primary-900"
                (click)="viewProduct(product)">
                Voir
              </button>
              <button
                *ngIf="authService.canAccessProductManagement()"
                type="button"
                class="text-sm text-gray-600 hover:text-gray-900"
                (click)="editProduct(product)">
                Modifier
              </button>
              <button
                *ngIf="authService.canAccessProductManagement()"
                type="button"
                [class]="product.isActive ? 'text-sm text-red-600 hover:text-red-900' : 'text-sm text-green-600 hover:text-green-900'"
                (click)="toggleProductStatus(product)">
                {{ product.isActive ? 'Désactiver' : 'Réactiver' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="products().length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun produit trouvé</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ searchForm.get('search')?.value ? 'Essayez de modifier vos critères de recherche.' : 'Commencez par créer un nouveau produit.' }}
          </p>
        </div>
      </div>

    </div>
  `,
  styles: []
})
export class ProductListComponent implements OnInit {
  private fb = inject(FormBuilder);
  public productService = inject(ProductService);
  public authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  // Reactive state
  public loading = signal(false);
  public showFilters = signal(false);
  public products = signal<Product[]>([]);
  public categories = signal<ProductCategory[]>([]);
  public paginatedResponse = signal<PaginatedProductsResponse | null>(null);
  public currentPage = signal(1);
  public itemsPerPage = signal(10);

  // Computed values
  public activeFiltersCount = computed(() => {
    const formValue = this.searchForm.value;
    let count = 0;
    if (formValue.status) count++;
    if (formValue.category) count++;
    if (formValue.sortBy !== 'description') count++;
    if (formValue.sortOrder !== 'ASC') count++;
    return count;
  });

  // Form
  public searchForm: FormGroup = this.fb.group({
    search: [''],
    status: [''],
    category: [''],
    sortBy: ['description'],
    sortOrder: ['ASC']
  });

  private searchTimeout: any;

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  private loadCategories() {
    this.productService.getCategories().subscribe({
      next: (response) => {
        this.categories.set(response.categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadProducts() {
    this.loading.set(true);
    
    const filters: ProductFilters = {
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      ...this.searchForm.value
    };

    this.productService.getProducts(filters).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.paginatedResponse.set(response);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
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
      this.loadProducts();
    }, 300);
  }

  onFiltersChange() {
    this.currentPage.set(1);
    this.loadProducts();
  }

  clearFilters() {
    this.searchForm.patchValue({
      search: '',
      status: '',
      category: '',
      sortBy: 'description',
      sortOrder: 'ASC'
    });
    this.currentPage.set(1);
    this.loadProducts();
  }

  // Pagination methods
  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadProducts();
  }

  changeItemsPerPage(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage.set(parseInt(target.value));
    this.currentPage.set(1);
    this.loadProducts();
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
      range.unshift(-1); // Ellipsis
    }
    if (current + delta < totalPages - 1) {
      range.push(-1); // Ellipsis
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
    const baseClasses = 'relative inline-flex items-center px-2 py-0.5 text-xs font-semibold';
    if (page === this.currentPage()) {
      return `${baseClasses} z-10 bg-primary-100 text-primary-700 ring-1 ring-inset ring-gray-300 focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600`;
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

  // Product actions
  viewProduct(product: Product) {
    // TODO: Navigate to product detail view
  }

  editProduct(product: Product) {
    // TODO: Open edit modal or navigate to edit page
  }

  openCreateModal() {
    // TODO: Open create product modal
  }

  toggleProductStatus(product: Product) {
    const action = product.isActive ? 'désactiver' : 'réactiver';
    
    if (confirm(`Êtes-vous sûr de vouloir ${action} ce produit ?`)) {
      if (product.isActive) {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.notificationService.showSuccess('Produit désactivé avec succès');
            this.loadProducts();
          },
          error: (error: any) => {
            console.error('Error deactivating product:', error);
            this.notificationService.showError('Erreur lors de la désactivation');
          }
        });
      } else {
        this.productService.reactivateProduct(product.id).subscribe({
          next: () => {
            this.notificationService.showSuccess('Produit réactivé avec succès');
            this.loadProducts();
          },
          error: (error: any) => {
            console.error('Error reactivating product:', error);
            this.notificationService.showError('Erreur lors de la réactivation');
          }
        });
      }
    }
  }

  getStatusClass(isActive: boolean): string {
    return isActive 
      ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
      : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800';
  }
}