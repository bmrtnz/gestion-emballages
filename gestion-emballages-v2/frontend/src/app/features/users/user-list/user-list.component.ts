import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { UserService, UserFilters, PaginatedUsersResponse } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { UserListSkeletonComponent } from '@shared/components/ui/user-list-skeleton.component';
import { ButtonComponent } from '@shared/components/ui/button.component';
import { SlidePanelComponent } from '@shared/components/ui/slide-panel.component';
import { ToggleButtonComponent } from '@shared/components/ui/toggle-button.component';
import { AddUserFormComponent } from '../components/add-user-form.component';
import { User, UserRole, EntityType } from '@core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule,
    LoadingSpinnerComponent,
    UserListSkeletonComponent,
    ButtonComponent,
    SlidePanelComponent,
    ToggleButtonComponent,
    AddUserFormComponent
  ],
  template: `
    <div class="min-h-screen">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Utilisateurs</h1>
        <p class="text-sm text-gray-500">Gérez les utilisateurs de la plateforme ici.</p>
      </div>
      
      <div class="space-y-6">

      <!-- Search and Filters -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <form [formGroup]="searchForm" class="space-y-4">
          
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
                formControlName="search"
                class="form-input pl-10"
                placeholder="Rechercher par nom ou email..."
                (input)="onSearchChange()">
            </div>

            <!-- Add User Button -->
            <ui-button
              *ngIf="authService.canAccessUserManagement()"
              variant="primary"
              size="md"
              (click)="openCreateModal()">
              Ajouter un Utilisateur
            </ui-button>
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

              <!-- Role Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select formControlName="role" class="form-select" (change)="onFiltersChange()">
                  <option value="">Tous les rôles</option>
                  <option *ngFor="let role of availableRoles()" [value]="role">
                    {{ userService.getRoleDisplayName(role) }}
                  </option>
                </select>
              </div>

              <!-- Entity Type Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type d'entité</label>
                <select formControlName="entiteType" class="form-select" (change)="onFiltersChange()">
                  <option value="">Tous</option>
                  <option value="Station">Station</option>
                  <option value="Fournisseur">Fournisseur</option>
                </select>
              </div>

              <!-- Sort By -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
                <select formControlName="sortBy" class="form-select" (change)="onFiltersChange()">
                  <option value="nomComplet">Nom</option>
                  <option value="email">Email</option>
                  <option value="role">Rôle</option>
                  <option value="createdAt">Date de création</option>
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

      <!-- Progressive content loading -->
      <ng-container *ngIf="!initialLoading(); else skeleton">
        <!-- Loading State for subsequent loads -->
        <div *ngIf="loading()" class="flex justify-center py-12">
          <app-loading-spinner size="lg" message="Chargement des utilisateurs..."></app-loading-spinner>
        </div>

        <!-- Users Table -->
        <div *ngIf="!loading()" class="overflow-hidden">
        
        <!-- Desktop Table -->
        <div class="hidden md:block">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entité
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
              <tr *ngFor="let user of users(); trackBy: trackByUserId" 
                  class="hover:bg-gray-50">
                
                <!-- User Info -->
                <td class="px-6 py-2">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ user.nomComplet }}</div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </td>

                <!-- Role -->
                <td class="px-6 py-2">
                  <span [class]="getRoleClass(user.role)">
                    {{ userService.getRoleDisplayName(user.role) }}
                  </span>
                </td>

                <!-- Entity -->
                <td class="px-6 py-2">
                  <div class="text-sm text-gray-900">
                    <div *ngIf="user.station">
                      <span class="font-medium">{{ user.station.nom }}</span>
                    </div>
                    <div *ngIf="user.fournisseur">
                      <span class="font-medium">{{ user.fournisseur.nom }}</span>
                    </div>
                    <div *ngIf="!user.station && !user.fournisseur">
                      <!-- Empty for Manager/Gestionnaire -->
                    </div>
                  </div>
                </td>

                <!-- Status -->
                <td class="px-6 py-2">
                  <span [class]="getStatusClass(user.isActive)">
                    {{ user.isActive ? 'Actif' : 'Inactif' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-6 py-2 text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      class="text-primary-600 hover:text-primary-900"
                      (click)="viewUser(user)"
                      title="Voir les détails">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    <button
                      *ngIf="canEditUser(user)"
                      type="button"
                      class="text-gray-600 hover:text-gray-900"
                      (click)="editUser(user)"
                      title="Modifier">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button
                      *ngIf="canDeleteUser(user)"
                      type="button"
                      [class]="user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                      (click)="toggleUserStatus(user)"
                      [title]="user.isActive ? 'Désactiver' : 'Réactiver'">
                      <svg *ngIf="user.isActive" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <svg *ngIf="!user.isActive" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div *ngFor="let user of users(); trackBy: trackByUserId" 
               class="border border-gray-200 rounded-lg p-4 space-y-3">
            
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="text-sm font-medium text-gray-900">{{ user.nomComplet }}</h3>
                <p class="text-sm text-gray-500">{{ user.email }}</p>
              </div>
              <span [class]="getStatusClass(user.isActive)">
                {{ user.isActive ? 'Actif' : 'Inactif' }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">Rôle:</span>
                <span class="ml-1 text-gray-900">{{ userService.getRoleDisplayName(user.role) }}</span>
              </div>
              <div>
                <span class="text-gray-500">Entité:</span>
                <span class="ml-1 text-gray-900">
                  {{ user.station?.nom || user.fournisseur?.nom || '' }}
                </span>
              </div>
            </div>

            <!-- Mobile Actions -->
            <div class="flex justify-end space-x-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                class="text-sm text-primary-600 hover:text-primary-900"
                (click)="viewUser(user)">
                Voir
              </button>
              <button
                *ngIf="canEditUser(user)"
                type="button"
                class="text-sm text-gray-600 hover:text-gray-900"
                (click)="editUser(user)">
                Modifier
              </button>
              <button
                *ngIf="canDeleteUser(user)"
                type="button"
                [class]="user.isActive ? 'text-sm text-red-600 hover:text-red-900' : 'text-sm text-green-600 hover:text-green-900'"
                (click)="toggleUserStatus(user)">
                {{ user.isActive ? 'Désactiver' : 'Réactiver' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="users().length === 0" class="text-center py-12">
          <lucide-icon name="users" class="mx-auto h-12 w-12 text-gray-400"></lucide-icon>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur trouvé</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ searchForm.get('search')?.value ? 'Essayez de modifier vos critères de recherche.' : 'Commencez par créer un nouvel utilisateur.' }}
          </p>
        </div>
      </div>

      <!-- Pagination -->
      <div *ngIf="paginatedResponse() && paginatedResponse()!.totalPages > 1" 
           class="flex items-center justify-between border-t border-gray-200 px-0 py-3 sm:px-0">
        
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
        </div> <!-- Close overflow-hidden wrapper -->
      </ng-container>
      
      <ng-template #skeleton>
        <app-user-list-skeleton></app-user-list-skeleton>
      </ng-template>
      </div> <!-- Close space-y-6 wrapper -->
    </div>

    <!-- Add User Slide Panel -->
    <ui-slide-panel
      [open]="showAddUserPanel()"
      title="Ajouter un utilisateur"
      size="lg"
      (close)="closeAddUserPanel()">
      
      <app-add-user-form
        (cancel)="closeAddUserPanel()"
        (userCreated)="onUserCreated()">
      </app-add-user-form>
    </ui-slide-panel>
  `,
  styles: []
})
export class UserListComponent implements OnInit {
  private fb = inject(FormBuilder);
  public userService = inject(UserService);
  public authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  // Reactive state
  public loading = signal(false);
  public initialLoading = signal(true);
  public showFilters = signal(false);
  public showAddUserPanel = signal(false);
  public users = signal<User[]>([]);
  public paginatedResponse = signal<PaginatedUsersResponse | null>(null);
  public currentPage = signal(1);
  public itemsPerPage = signal(20);

  // Computed values
  public activeFiltersCount = computed(() => {
    const formValue = this.searchForm.value;
    let count = 0;
    if (formValue.status) count++;
    if (formValue.role) count++;
    if (formValue.entiteType) count++;
    if (formValue.sortBy !== 'nomComplet') count++;
    return count;
  });

  public availableRoles = computed(() => {
    const currentUserRole = this.authService.userRole();
    return currentUserRole ? this.userService.getAvailableRoles(currentUserRole) : [];
  });

  // Form
  public searchForm: FormGroup = this.fb.group({
    search: [''],
    status: [''],
    role: [''],
    entiteType: [''],
    sortBy: ['nomComplet'],
    sortOrder: ['ASC']
  });

  private searchTimeout: any;

  ngOnInit() {
    // Set a minimal delay to ensure smooth transition and prevent flicker
    setTimeout(() => {
      this.loadUsers();
    }, 50);
  }

  loadUsers() {
    this.loading.set(true);
    
    const filters: UserFilters = {
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      ...this.searchForm.value
    };

    this.userService.getUsers(filters).subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.paginatedResponse.set(response);
        this.loading.set(false);
        this.initialLoading.set(false); // Critical: set after data loads
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading.set(false);
        this.initialLoading.set(false);
      }
    });
  }

  onSearchChange() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadUsers();
    }, 300);
  }

  onFiltersChange() {
    this.currentPage.set(1);
    this.loadUsers();
  }

  clearFilters() {
    this.searchForm.patchValue({
      search: '',
      status: '',
      role: '',
      entiteType: '',
      sortBy: 'nomComplet',
      sortOrder: 'ASC'
    });
    this.currentPage.set(1);
    this.loadUsers();
  }

  // Pagination methods
  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadUsers();
  }

  changeItemsPerPage(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage.set(parseInt(target.value));
    this.currentPage.set(1);
    this.loadUsers();
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

  // User actions
  viewUser(user: User) {
    console.log('View user:', user);
  }

  editUser(user: User) {
    console.log('Edit user:', user);
  }

  openCreateModal() {
    this.showAddUserPanel.set(true);
  }

  closeAddUserPanel() {
    this.showAddUserPanel.set(false);
  }

  onUserCreated() {
    this.showAddUserPanel.set(false);
    // Reload the user list to show the new user
    this.loadUsers();
  }

  toggleUserStatus(user: User) {
    const action = user.isActive ? 'désactiver' : 'réactiver';
    
    if (confirm(`Êtes-vous sûr de vouloir ${action} cet utilisateur ?`)) {
      if (user.isActive) {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.notificationService.showSuccess('Utilisateur désactivé avec succès');
            this.loadUsers();
          },
          error: (error: any) => {
            console.error('Error deactivating user:', error);
            this.notificationService.showError('Erreur lors de la désactivation');
          }
        });
      } else {
        this.userService.reactivateUser(user.id).subscribe({
          next: () => {
            this.notificationService.showSuccess('Utilisateur réactivé avec succès');
            this.loadUsers();
          },
          error: (error: any) => {
            console.error('Error reactivating user:', error);
            this.notificationService.showError('Erreur lors de la réactivation');
          }
        });
      }
    }
  }

  // Permission methods
  canEditUser(user: User): boolean {
    const currentUserRole = this.authService.userRole();
    return currentUserRole ? this.userService.canEditUser(currentUserRole, user.role) : false;
  }

  canDeleteUser(user: User): boolean {
    const currentUserRole = this.authService.userRole();
    return currentUserRole ? this.userService.canDeleteUser(currentUserRole, user.role) : false;
  }

  // Utility methods
  getRoleClass(role: UserRole): string {
    const roleClasses = {
      [UserRole.ADMIN]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
      [UserRole.MANAGER]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800',
      [UserRole.GESTIONNAIRE]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
      [UserRole.STATION]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
      [UserRole.FOURNISSEUR]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800'
    };
    return roleClasses[role] || 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
  }

  getStatusClass(isActive: boolean): string {
    return isActive 
      ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
      : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800';
  }

  // TrackBy function for performance optimization
  trackByUserId(index: number, user: User): string {
    return user.id;
  }
}