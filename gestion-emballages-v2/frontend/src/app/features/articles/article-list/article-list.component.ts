import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ArticleService, ArticleFilters } from '@core/services/article.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { Article, ArticleCategory, PaginatedArticlesResponse } from '@core/models/article.model';

@Component({
  selector: 'app-article-list',
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
          <h1 class="text-2xl font-bold text-gray-900">Articles</h1>
          <p class="text-gray-600">Gestion des articles et emballages</p>
        </div>
        
        <button
          *ngIf="authService.canAccessArticleManagement()"
          type="button"
          class="btn-primary"
          (click)="openCreateModal()">
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouvel article
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
                placeholder="Rechercher par code, désignation ou fournisseur..."
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
                <select formControlName="categorie" class="form-select" (change)="onFiltersChange()">
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
                  <option value="designation">Désignation</option>
                  <option value="codeArticle">Code article</option>
                  <option value="categorie">Catégorie</option>
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
        <app-loading-spinner size="lg" message="Chargement des articles..."></app-loading-spinner>
      </div>

      <!-- Articles Table -->
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
              <tr *ngFor="let article of articles()" class="hover:bg-gray-50">
                
                <!-- Article Info -->
                <td class="px-6 py-4">
                  <div>
                    <div class="font-medium text-gray-900">{{ article.designation }}</div>
                    <div class="text-sm text-gray-500">{{ article.codeArticle }}</div>
                  </div>
                </td>

                <!-- Category -->
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {{ article.categorie }}
                  </span>
                </td>

                <!-- Suppliers -->
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">
                    {{ articleService.getSuppliersCount(article.articleFournisseurs) }} fournisseur(s)
                  </div>
                  <div *ngIf="article.articleFournisseurs.length > 0" class="text-xs text-gray-500">
                    {{ article.articleFournisseurs[0].fournisseur?.nom }}
                    <span *ngIf="article.articleFournisseurs.length > 1">
                      +{{ article.articleFournisseurs.length - 1 }} autre(s)
                    </span>
                  </div>
                </td>

                <!-- Price -->
                <td class="px-6 py-4">
                  <div *ngIf="article.articleFournisseurs.length > 0" class="text-sm">
                    <div class="text-gray-900">
                      {{ articleService.formatPrice(articleService.getLowestPrice(article.articleFournisseurs)!) }}
                    </div>
                    <div *ngIf="articleService.getLowestPrice(article.articleFournisseurs) !== articleService.getHighestPrice(article.articleFournisseurs)" 
                         class="text-xs text-gray-500">
                      à {{ articleService.formatPrice(articleService.getHighestPrice(article.articleFournisseurs)!) }}
                    </div>
                  </div>
                  <div *ngIf="article.articleFournisseurs.length === 0" class="text-sm text-gray-400">
                    Aucun prix
                  </div>
                </td>

                <!-- Status -->
                <td class="px-6 py-4">
                  <span [class]="getStatusClass(article.isActive)">
                    {{ article.isActive ? 'Actif' : 'Inactif' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      class="text-primary-600 hover:text-primary-900"
                      (click)="viewArticle(article)"
                      title="Voir les détails">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    <button
                      *ngIf="authService.canAccessArticleManagement()"
                      type="button"
                      class="text-gray-600 hover:text-gray-900"
                      (click)="editArticle(article)"
                      title="Modifier">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button
                      *ngIf="authService.canAccessArticleManagement()"
                      type="button"
                      [class]="article.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                      (click)="toggleArticleStatus(article)"
                      [title]="article.isActive ? 'Désactiver' : 'Réactiver'">
                      <svg *ngIf="article.isActive" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <svg *ngIf="!article.isActive" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div *ngFor="let article of articles()" 
               class="border border-gray-200 rounded-lg p-4 space-y-3">
            
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">{{ article.designation }}</h3>
                <p class="text-sm text-gray-500">{{ article.codeArticle }}</p>
              </div>
              <span [class]="getStatusClass(article.isActive)">
                {{ article.isActive ? 'Actif' : 'Inactif' }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Catégorie:</span>
                <span class="ml-1 text-gray-900">{{ article.categorie }}</span>
              </div>
              <div>
                <span class="text-gray-500">Fournisseurs:</span>
                <span class="ml-1 text-gray-900">{{ articleService.getSuppliersCount(article.articleFournisseurs) }}</span>
              </div>
            </div>

            <div *ngIf="article.articleFournisseurs.length > 0" class="text-sm">
              <span class="text-gray-500">Prix:</span>
              <span class="ml-1 text-gray-900">
                {{ articleService.formatPrice(articleService.getLowestPrice(article.articleFournisseurs)!) }}
                <span *ngIf="articleService.getLowestPrice(article.articleFournisseurs) !== articleService.getHighestPrice(article.articleFournisseurs)">
                  - {{ articleService.formatPrice(articleService.getHighestPrice(article.articleFournisseurs)!) }}
                </span>
              </span>
            </div>

            <!-- Mobile Actions -->
            <div class="flex justify-end space-x-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                class="text-sm text-primary-600 hover:text-primary-900"
                (click)="viewArticle(article)">
                Voir
              </button>
              <button
                *ngIf="authService.canAccessArticleManagement()"
                type="button"
                class="text-sm text-gray-600 hover:text-gray-900"
                (click)="editArticle(article)">
                Modifier
              </button>
              <button
                *ngIf="authService.canAccessArticleManagement()"
                type="button"
                [class]="article.isActive ? 'text-sm text-red-600 hover:text-red-900' : 'text-sm text-green-600 hover:text-green-900'"
                (click)="toggleArticleStatus(article)">
                {{ article.isActive ? 'Désactiver' : 'Réactiver' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="articles().length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun article trouvé</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ searchForm.get('search')?.value ? 'Essayez de modifier vos critères de recherche.' : 'Commencez par créer un nouvel article.' }}
          </p>
        </div>
      </div>

      <!-- Pagination -->
      <div *ngIf="paginatedResponse() && paginatedResponse()!.totalPages > 1" 
           class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
        
        <!-- Results Info -->
        <div class="flex flex-1 justify-between sm:hidden">
          <button
            [disabled]="!paginatedResponse()?.hasPreviousPage"
            (click)="goToPage(currentPage() - 1)"
            class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Précédent
          </button>
          <button
            [disabled]="!paginatedResponse()?.hasNextPage"
            (click)="goToPage(currentPage() + 1)"
            class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Suivant
          </button>
        </div>
        
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Affichage de
              <span class="font-medium">{{ getResultStart() }}</span>
              à
              <span class="font-medium">{{ getResultEnd() }}</span>
              sur
              <span class="font-medium">{{ paginatedResponse()?.total }}</span>
              résultats
            </p>
          </div>
          
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-700">Afficher:</label>
            <select
              [value]="itemsPerPage()"
              (change)="changeItemsPerPage($event)"
              class="form-select text-sm">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span class="text-sm text-gray-700">par page</span>
          </div>
          
          <div>
            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                [disabled]="!paginatedResponse()?.hasPreviousPage"
                (click)="goToPage(currentPage() - 1)"
                class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <button
                *ngFor="let page of getVisiblePages()"
                [class]="getPageButtonClass(page)"
                (click)="goToPage(page)">
                {{ page }}
              </button>
              
              <button
                [disabled]="!paginatedResponse()?.hasNextPage"
                (click)="goToPage(currentPage() + 1)"
                class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ArticleListComponent implements OnInit {
  private fb = inject(FormBuilder);
  public articleService = inject(ArticleService);
  public authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  // Reactive state
  public loading = signal(false);
  public showFilters = signal(false);
  public articles = signal<Article[]>([]);
  public categories = signal<ArticleCategory[]>([]);
  public paginatedResponse = signal<PaginatedArticlesResponse | null>(null);
  public currentPage = signal(1);
  public itemsPerPage = signal(20);

  // Computed values
  public activeFiltersCount = computed(() => {
    const formValue = this.searchForm.value;
    let count = 0;
    if (formValue.status) count++;
    if (formValue.categorie) count++;
    if (formValue.sortBy !== 'designation') count++;
    if (formValue.sortOrder !== 'ASC') count++;
    return count;
  });

  // Form
  public searchForm: FormGroup = this.fb.group({
    search: [''],
    status: [''],
    categorie: [''],
    sortBy: ['designation'],
    sortOrder: ['ASC']
  });

  private searchTimeout: any;

  ngOnInit() {
    this.loadCategories();
    this.loadArticles();
  }

  private loadCategories() {
    this.articleService.getCategories().subscribe({
      next: (response) => {
        this.categories.set(response.categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadArticles() {
    this.loading.set(true);
    
    const filters: ArticleFilters = {
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      ...this.searchForm.value
    };

    this.articleService.getArticles(filters).subscribe({
      next: (response) => {
        this.articles.set(response.data);
        this.paginatedResponse.set(response);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading articles:', error);
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
      this.loadArticles();
    }, 300);
  }

  onFiltersChange() {
    this.currentPage.set(1);
    this.loadArticles();
  }

  clearFilters() {
    this.searchForm.patchValue({
      search: '',
      status: '',
      categorie: '',
      sortBy: 'designation',
      sortOrder: 'ASC'
    });
    this.currentPage.set(1);
    this.loadArticles();
  }

  // Pagination methods
  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadArticles();
  }

  changeItemsPerPage(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage.set(parseInt(target.value));
    this.currentPage.set(1);
    this.loadArticles();
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

  // Article actions
  viewArticle(article: Article) {
    // TODO: Navigate to article detail view
    console.log('View article:', article);
  }

  editArticle(article: Article) {
    // TODO: Open edit modal or navigate to edit page
    console.log('Edit article:', article);
  }

  openCreateModal() {
    // TODO: Open create article modal
    console.log('Create new article');
  }

  toggleArticleStatus(article: Article) {
    const action = article.isActive ? 'désactiver' : 'réactiver';
    
    if (confirm(`Êtes-vous sûr de vouloir ${action} cet article ?`)) {
      if (article.isActive) {
        this.articleService.deleteArticle(article.id).subscribe({
          next: () => {
            this.notificationService.showSuccess('Article désactivé avec succès');
            this.loadArticles();
          },
          error: (error: any) => {
            console.error('Error deactivating article:', error);
            this.notificationService.showError('Erreur lors de la désactivation');
          }
        });
      } else {
        this.articleService.reactivateArticle(article.id).subscribe({
          next: () => {
            this.notificationService.showSuccess('Article réactivé avec succès');
            this.loadArticles();
          },
          error: (error: any) => {
            console.error('Error reactivating article:', error);
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