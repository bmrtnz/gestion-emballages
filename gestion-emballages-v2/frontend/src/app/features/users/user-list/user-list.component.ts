import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { UserService, UserFilters, PaginatedUsersResponse } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { UserListSkeletonComponent } from '@shared/components/ui/user-list-skeleton.component';
import { ButtonComponent } from '@shared/components/ui/button.component';
import { SlidePanelComponent } from '@shared/components/ui/slide-panel.component';
import { ToggleButtonComponent } from '@shared/components/ui/toggle-button.component';
import { AddUserFormComponent } from '../components/add-user-form.component';
import { EditUserFormComponent } from '../components/edit-user-form.component';
import { User, UserRole, EntityType } from '@core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule,
    TranslocoModule,
    LoadingSpinnerComponent,
    UserListSkeletonComponent,
    ButtonComponent,
    SlidePanelComponent,
    ToggleButtonComponent,
    AddUserFormComponent,
    EditUserFormComponent
  ],
  template: `
    <div class="space-y-6">

      <!-- Search, Filters and Add Button Row -->
      <div class="flex items-start gap-4 mb-6">
        <!-- Filter Panel (Left side) -->
        <div class="flex-1 bg-gray-100 rounded-lg p-4 border border-gray-200">
          <form [formGroup]="searchForm" class="space-y-4">
            
            <!-- Search Bar -->
            <div class="flex items-center space-x-4">
              <ui-toggle-button
                [label]="'common.filters' | transloco"
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
                  [placeholder]="'users.searchPlaceholder' | transloco"
                  (input)="onSearchChange()">
              </div>

              <!-- Reset Filters Button -->
              <ui-button
                type="button"
                variant="outline"
                size="md"
                (click)="clearFilters()">
                {{ 'users.resetFilters' | transloco }}
              </ui-button>
            </div>

            <!-- Filters Panel -->
            <div *ngIf="showFilters()" class="border-t pt-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <!-- Status Filter -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'common.status' | transloco }}</label>
                  <select formControlName="status" class="form-select" (change)="onFiltersChange()">
                    <option value="">{{ 'common.all' | transloco }}</option>
                    <option value="active">{{ 'common.active' | transloco }}</option>
                    <option value="inactive">{{ 'common.inactive' | transloco }}</option>
                  </select>
                </div>

                <!-- Role Filter -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'users.role' | transloco }}</label>
                  <select formControlName="role" class="form-select" (change)="onFiltersChange()">
                    <option value="">{{ 'common.all' | transloco }}</option>
                    <option *ngFor="let role of availableRoles()" [value]="role">
                      {{ userService.getRoleDisplayName(role) }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Add User Button (Right side) - Fixed position aligned with search bar -->
        <div class="flex-shrink-0 pt-4">
          <ui-button
            [variant]="authService.canAccessUserManagement() ? 'primary' : 'secondary'"
            size="md"
            [disabled]="!authService.canAccessUserManagement()"
            (click)="authService.canAccessUserManagement() ? openCreateModal() : null">
            {{ 'users.createUser' | transloco }}
          </ui-button>
        </div>
      </div>

      <!-- Progressive content loading -->
      <ng-container *ngIf="!initialLoading(); else skeleton">
        <!-- Loading State for subsequent loads -->
        <div *ngIf="loading()" class="flex justify-center py-12">
          <app-loading-spinner size="lg" [message]="'common.loading' | transloco"></app-loading-spinner>
        </div>

        <!-- Users Table -->
        <div *ngIf="!loading()" class="overflow-hidden">
        
        <!-- Pagination Controls -->
        <div *ngIf="paginatedResponse() && paginatedResponse()!.totalPages > 1" 
             class="flex items-center justify-between border-b border-gray-200 px-6 py-2">
          
          <!-- Mobile pagination (Previous/Next only) -->
          <div class="flex flex-1 justify-between sm:hidden">
            <button
              [disabled]="!paginatedResponse()?.hasPreviousPage"
              (click)="goToPage(currentPage() - 1)"
              class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ 'pagination.previous' | transloco }}
            </button>
            <button
              [disabled]="!paginatedResponse()?.hasNextPage"
              (click)="goToPage(currentPage() + 1)"
              class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ 'pagination.next' | transloco }}
            </button>
          </div>
          
          <!-- Desktop pagination (Full controls) -->
          <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p class="text-xs text-gray-700">
                {{ 'users.displaying' | transloco : { 
                  start: getResultStart(), 
                  end: getResultEnd(), 
                  total: paginatedResponse()?.total 
                } }}
              </p>
            </div>
            
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <label class="text-xs text-gray-700">{{ 'pagination.show' | transloco }}:</label>
                <select
                  [value]="itemsPerPage()"
                  (change)="changeItemsPerPage($event)"
                  class="border border-gray-300 rounded px-2 py-0.5 text-xs bg-white w-14 focus:ring-1 focus:ring-primary-500 focus:border-primary-500">
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <span class="text-xs text-gray-700">{{ 'users.showPerPage' | transloco }}</span>
              </div>
              
              <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <!-- Previous Page -->
                <button
                  [disabled]="!paginatedResponse()?.hasPreviousPage"
                  (click)="goToPage(currentPage() - 1)"
                  class="relative inline-flex items-center rounded-l-md px-2 py-0.5 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a1 1 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                  </svg>
                </button>
                
                <!-- Page Numbers -->
                <button
                  *ngFor="let page of getVisiblePages(); trackBy: trackByPage"
                  (click)="goToPage(page)"
                  [class]="getPageButtonClass(page)">
                  {{ page }}
                </button>
                
                <!-- Next Page -->
                <button
                  [disabled]="!paginatedResponse()?.hasNextPage"
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
                  {{ 'users.user' | transloco }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ 'users.role' | transloco }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ 'users.entity' | transloco }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ 'users.email' | transloco }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ 'users.phone' | transloco }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ 'common.status' | transloco }}
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ 'common.actions' | transloco }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let user of users(); trackBy: trackByUserId" 
                  class="hover:bg-gray-50">
                
                <!-- Utilisateur (nom complet) -->
                <td class="px-6 py-2">
                  <div class="text-sm font-medium text-gray-900">{{ user.fullName }}</div>
                </td>

                <!-- Rôle -->
                <td class="px-6 py-2">
                  <span [class]="getRoleClass(user.role)">
                    {{ userService.getRoleDisplayName(user.role) }}
                  </span>
                </td>

                <!-- Entité -->
                <td class="px-6 py-2">
                  <div class="text-sm text-gray-900">
                    <span *ngIf="user.station" class="font-medium">{{ user.station.name }}</span>
                    <span *ngIf="user.supplier" class="font-medium">{{ user.supplier.name }}</span>
                    <span *ngIf="!user.station && !user.supplier && isBlueWhaleRole(user.role)" class="font-medium text-blue-600">{{ 'common.blueWhale' | transloco }}</span>
                  </div>
                </td>

                <!-- Email -->
                <td class="px-6 py-2">
                  <div class="text-sm text-gray-900">{{ user.email }}</div>
                </td>

                <!-- Téléphone -->
                <td class="px-6 py-2">
                  <div class="text-sm text-gray-900">{{ user.phone || '-' }}</div>
                </td>

                <!-- Statut -->
                <td class="px-6 py-2">
                  <span [class]="getStatusClass(user.isActive)">
                    {{ user.isActive ? ('common.active' | transloco) : ('common.inactive' | transloco) }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-6 py-2 text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      [class]="canEditUser(user) ? 'text-gray-600 hover:text-gray-900' : 'text-gray-300 cursor-not-allowed'"
                      [disabled]="!canEditUser(user)"
                      (click)="canEditUser(user) ? editUser(user) : null"
                      [title]="canEditUser(user) ? ('common.edit' | transloco) : ('Action non autorisée')">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      [class]="canDeactivateUser(user) ? (user.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900') : 'text-gray-300 cursor-not-allowed'"
                      [disabled]="!canDeactivateUser(user)"
                      (click)="canDeactivateUser(user) ? toggleUserStatus(user) : null"
                      [title]="canDeactivateUser(user) ? (user.isActive ? ('common.deactivate' | transloco) : ('common.activate' | transloco)) : ('Action non autorisée')">
                      <lucide-icon *ngIf="user.isActive" name="square-pause-icon" class="h-4 w-4"></lucide-icon>
                      <lucide-icon *ngIf="!user.isActive" name="square-play-icon" class="h-4 w-4"></lucide-icon>
                    </button>

                    <button
                      type="button"
                      [class]="canHardDeleteUser(user) ? 'text-red-600 hover:text-red-900' : 'text-gray-300 cursor-not-allowed'"
                      [disabled]="!canHardDeleteUser(user)"
                      (click)="canHardDeleteUser(user) ? hardDeleteUser(user) : null"
                      [title]="canHardDeleteUser(user) ? 'Supprimer définitivement' : 'Action non autorisée'">
                      <lucide-icon name="square-x" class="h-4 w-4"></lucide-icon>
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
          <div *ngFor="let user of users(); trackBy: trackByUserId" 
               class="border border-gray-200 rounded-lg p-4 space-y-3">
            
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="text-sm font-medium text-gray-900">{{ user.fullName }}</h3>
                <p class="text-sm text-gray-500">{{ user.email }}</p>
              </div>
              <span [class]="getStatusClass(user.isActive)">
                {{ user.isActive ? ('common.active' | transloco) : ('common.inactive' | transloco) }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500">{{ 'users.role' | transloco }}:</span>
                <span class="ml-1 text-gray-900">{{ userService.getRoleDisplayName(user.role) }}</span>
              </div>
              <div>
                <span class="text-gray-500">{{ 'users.entity' | transloco }}:</span>
                <span class="ml-1 text-gray-900">
                  <span *ngIf="user.station">{{ user.station.name }}</span>
                  <span *ngIf="user.supplier">{{ user.supplier.name }}</span>
                  <span *ngIf="!user.station && !user.supplier && isBlueWhaleRole(user.role)" class="text-blue-600">{{ 'common.blueWhale' | transloco }}</span>
                </span>
              </div>
              <div>
                <span class="text-gray-500">{{ 'users.phone' | transloco }}:</span>
                <span class="ml-1 text-gray-900">{{ user.phone || '-' }}</span>
              </div>
            </div>

            <!-- Mobile Actions -->
            <div class="flex justify-end space-x-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                [class]="canEditUser(user) ? 'text-sm text-gray-600 hover:text-gray-900' : 'text-sm text-gray-300 cursor-not-allowed'"
                [disabled]="!canEditUser(user)"
                (click)="canEditUser(user) ? editUser(user) : null">
                {{ 'common.edit' | transloco }}
              </button>
              <button
                type="button"
                [class]="canDeactivateUser(user) ? (user.isActive ? 'text-sm text-orange-600 hover:text-orange-900' : 'text-sm text-green-600 hover:text-green-900') : 'text-sm text-gray-300 cursor-not-allowed'"
                [disabled]="!canDeactivateUser(user)"
                (click)="canDeactivateUser(user) ? toggleUserStatus(user) : null">
                <lucide-icon [name]="user.isActive ? 'square-pause-icon' : 'square-play-icon'" class="h-4 w-4 inline mr-1"></lucide-icon>
                {{ user.isActive ? ('common.deactivate' | transloco) : ('common.activate' | transloco) }}
              </button>
              <button
                type="button"
                [class]="canHardDeleteUser(user) ? 'text-sm text-red-600 hover:text-red-900' : 'text-sm text-gray-300 cursor-not-allowed'"
                [disabled]="!canHardDeleteUser(user)"
                (click)="canHardDeleteUser(user) ? hardDeleteUser(user) : null">
                <lucide-icon name="square-x" class="h-4 w-4 inline mr-1"></lucide-icon>
                Supprimer
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

      </ng-container>
      
      <ng-template #skeleton>
        <app-user-list-skeleton></app-user-list-skeleton>
      </ng-template>
    </div> <!-- Close space-y-6 wrapper -->

    <!-- Add User Slide Panel -->
    <ui-slide-panel
      [open]="showAddUserPanel()"
      [title]="'users.createUser' | transloco"
      size="lg"
      (close)="closeAddUserPanel()">
      
      <app-add-user-form
        (cancel)="closeAddUserPanel()"
        (userCreated)="onUserCreated()">
      </app-add-user-form>
    </ui-slide-panel>

    <!-- Edit User Slide Panel -->
    <ui-slide-panel
      [open]="showEditUserPanel()"
      [title]="'users.editUser' | transloco"
      size="lg"
      (close)="closeEditUserPanel()">
      
      <app-edit-user-form
        *ngIf="selectedUser()"
        [user]="selectedUser()"
        (cancel)="closeEditUserPanel()"
        (userUpdated)="onUserUpdated()">
      </app-edit-user-form>
    </ui-slide-panel>
  `,
  styles: []
})
export class UserListComponent implements OnInit {
  private fb = inject(FormBuilder);
  public userService = inject(UserService);
  public authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private translocoService = inject(TranslocoService);

  // Reactive state
  public loading = signal(false);
  public initialLoading = signal(true);
  public showFilters = signal(false);
  public showAddUserPanel = signal(false);
  public showEditUserPanel = signal(false);
  public selectedUser = signal<User | null>(null);
  public users = signal<User[]>([]);
  public paginatedResponse = signal<PaginatedUsersResponse | null>(null);
  public currentPage = signal(1);
  public itemsPerPage = signal(10);
  
  // Signal to track form values for reactive computed
  public formValues = signal({
    search: '',
    status: 'active',
    role: ''
  });

  // Computed values
  public activeFiltersCount = computed(() => {
    const values = this.formValues();
    let count = 0;
    
    // Count search filter if it's not empty
    if (values.search && values.search.trim() !== '') count++;
    
    // Count status filter only if it's different from the default 'active'
    // Note: '' means 'Tous' (all), 'inactive' means inactive users
    if (values.status !== 'active') count++;
    
    // Count role filter if it's set (not empty)
    if (values.role && values.role !== '') count++;
    
    return count;
  });

  public availableRoles = computed(() => {
    const currentUserRole = this.authService.userRole();
    return currentUserRole ? this.userService.getAvailableRoles(currentUserRole) : [];
  });

  // Form
  public searchForm: FormGroup = this.fb.group({
    search: [''],
    status: ['active'],
    role: ['']
  });

  private searchTimeout: any;

  ngOnInit() {
    // Set a minimal delay to ensure smooth transition and prevent flicker
    setTimeout(() => {
      this.loadUsers();
    }, 50);
    
    // Subscribe to form changes to update the signal
    this.searchForm.valueChanges.subscribe(values => {
      this.formValues.set({
        search: values.search || '',
        status: values.status || '',
        role: values.role || ''
      });
    });
  }

  loadUsers() {
    this.loading.set(true);
    
    const filters: UserFilters = {
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      sortBy: 'fullName',
      sortOrder: 'ASC',
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
      status: 'active',
      role: ''
    });
    // Update the signal to reflect cleared filters
    this.formValues.set({
      search: '',
      status: 'active',
      role: ''
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

  // User actions
  editUser(user: User) {
    this.selectedUser.set(user);
    this.showEditUserPanel.set(true);
  }

  openCreateModal() {
    this.showAddUserPanel.set(true);
  }

  openModal() {
    this.openCreateModal();
  }

  closeAddUserPanel() {
    this.showAddUserPanel.set(false);
  }

  closeEditUserPanel() {
    this.showEditUserPanel.set(false);
    this.selectedUser.set(null);
  }

  onUserCreated() {
    this.showAddUserPanel.set(false);
    // Reload the user list to show the new user
    this.loadUsers();
  }

  onUserUpdated() {
    this.showEditUserPanel.set(false);
    this.selectedUser.set(null);
    // Reload the user list to show the updated user
    this.loadUsers();
  }

  toggleUserStatus(user: User) {
    if (user.isActive) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.notificationService.showSuccess(this.translocoService.translate('messages.userDeactivated'));
          this.loadUsers();
        },
        error: (error: any) => {
          console.error('Error deactivating user:', error);
          this.notificationService.showError(this.translocoService.translate('messages.errorOccurred'));
        }
      });
    } else {
      this.userService.reactivateUser(user.id).subscribe({
        next: () => {
          this.notificationService.showSuccess(this.translocoService.translate('messages.userActivated'));
          this.loadUsers();
        },
        error: (error: any) => {
          console.error('Error reactivating user:', error);
          this.notificationService.showError(this.translocoService.translate('messages.errorOccurred'));
        }
      });
    }
  }

  hardDeleteUser(user: User) {
    // Confirm before hard delete
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur ${user.fullName} ? Cette action est irréversible.`;
    
    if (confirm(confirmMessage)) {
      // Double confirmation for safety
      const secondConfirm = `ATTENTION: Cette action supprimera définitivement toutes les données de ${user.email}. Tapez "SUPPRIMER" pour confirmer.`;
      const userInput = prompt(secondConfirm);
      
      if (userInput === 'SUPPRIMER') {
        this.userService.hardDeleteUser(user.id, { cascadeDelete: true, confirmIntegrityCheck: true }).subscribe({
          next: () => {
            this.notificationService.showSuccess('Utilisateur supprimé définitivement');
            this.loadUsers();
          },
          error: (error: any) => {
            console.error('Error permanently deleting user:', error);
            this.notificationService.showError('Erreur lors de la suppression définitive');
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

  canDeactivateUser(user: User): boolean {
    const currentUserRole = this.authService.userRole();
    // Admin, Manager, and Handler can deactivate users
    if (currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.MANAGER || currentUserRole === UserRole.HANDLER) {
      // Prevent deactivating self
      const currentUser = this.authService.currentUser();
      return currentUser?.id !== user.id;
    }
    return false;
  }

  canHardDeleteUser(user: User): boolean {
    const currentUserRole = this.authService.userRole();
    // Only Admin can hard delete users
    if (currentUserRole === UserRole.ADMIN) {
      // Prevent deleting self
      const currentUser = this.authService.currentUser();
      return currentUser?.id !== user.id;
    }
    return false;
  }

  // Utility methods
  getRoleClass(role: UserRole): string {
    const roleClasses = {
      [UserRole.ADMIN]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
      [UserRole.MANAGER]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800',
      [UserRole.HANDLER]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
      [UserRole.STATION]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
      [UserRole.SUPPLIER]: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800'
    };
    return roleClasses[role] || 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
  }

  getStatusClass(isActive: boolean): string {
    return isActive 
      ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
      : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800';
  }

  isBlueWhaleRole(role: UserRole): boolean {
    return role === UserRole.ADMIN || role === UserRole.MANAGER || role === UserRole.HANDLER;
  }

  // TrackBy function for performance optimization
  trackByUserId(index: number, user: User): string {
    return user.id;
  }

  trackByPage(index: number, page: number): number {
    return page;
  }
}