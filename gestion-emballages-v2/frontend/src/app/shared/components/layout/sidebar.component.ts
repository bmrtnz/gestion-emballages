import { Component, inject, Input, Output, EventEmitter, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

import { AuthService } from '@core/services/auth.service';
import { ShoppingCartService } from '@core/services/shopping-cart.service';
import { UserRole } from '@core/models/user.model';
import { 
  SidebarNavigationStrategy,
  SidebarNavigationStrategyFactory,
  NavigationSection 
} from '@core/strategies/sidebar-navigation.strategy';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    LucideAngularModule
  ],
  template: `
    <div>
      <!-- Mobile sidebar overlay -->
      <div 
        *ngIf="sidebarOpen" 
        class="fixed inset-0 z-50 lg:hidden"
        (click)="closeMobileSidebar()">
        <div class="fixed inset-0 bg-gray-900/80 transition-opacity opacity-100">
        </div>
      </div>

      <!-- Mobile sidebar -->
      <div class="fixed inset-0 flex z-50 lg:hidden" *ngIf="sidebarOpen">
        <div class="relative mr-16 flex w-full max-w-xs flex-1 transition-transform duration-300 translate-x-0">
          
          <!-- Close button -->
          <div class="absolute left-full top-0 flex w-16 justify-center pt-5">
            <button type="button" class="-m-2.5 p-2.5" (click)="closeMobileSidebar()">
              <span class="sr-only">Close sidebar</span>
              <lucide-icon name="x" class="h-6 w-6 text-white"></lucide-icon>
            </button>
          </div>
          
          <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
            <nav class="flex flex-1 flex-col pt-4">
              <!-- User Profile -->
              <div class="flex items-center gap-x-4 mb-6">
                <div class="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                  <span class="text-sm font-medium text-white">{{ userInitials() }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-semibold text-gray-900">{{ authService.user()?.nomComplet }}</span>
                  <span class="text-xs text-gray-500">{{ getRoleDisplayName() }}</span>
                  <span *ngIf="entityName()" class="text-xs text-primary-600">{{ entityName() }}</span>
                </div>
              </div>

              <!-- Search -->
              <form *ngIf="shouldShowSearch()" class="relative mb-6" action="#" method="GET">
                <input
                  type="text"
                  name="search"
                  placeholder="Rechercher..."
                  class="w-full rounded-md border-gray-200 py-2 pl-10 pr-4 text-sm focus:ring-primary-500 focus:border-primary-500"
                />
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <lucide-icon name="search" class="h-5 w-5 text-gray-400"></lucide-icon>
                </div>
              </form>

              <!-- Navigation Sections -->
              <ul role="list" class="flex flex-1 flex-col gap-y-7">
                <li *ngFor="let section of navigationSections(); let isFirst = first">
                  <div *ngIf="section.title && !isFirst" class="text-xs font-semibold leading-6 text-gray-400">{{ section.title }}</div>
                  <ul role="list" class="-mx-2 space-y-1" [class.mt-2]="section.title && !isFirst">
                    <li *ngFor="let item of section.items" class="relative">
                      <a
                        [routerLink]="item.href"
                        routerLinkActive="bg-gray-50 text-primary-600"
                        [class]="getNavItemClasses()"
                        (click)="closeMobileSidebar()">
                        
                        <lucide-icon [name]="item.icon" [class]="getIconClasses()"></lucide-icon>
                        
                        <span class="flex-1">{{ item.name }}</span>
                        
                        <!-- Cart badge -->
                        <span 
                          *ngIf="item.badge === 'cart' && cartItemsCount() > 0"
                          class="ml-auto inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary-600 rounded-full">
                          {{ cartItemsCount() }}
                        </span>
                      </a>
                    </li>
                  </ul>
                </li>
                
                <!-- Logout -->
                <li class="mt-auto">
                  <a
                    (click)="handleLogout()"
                    href="#"
                    class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                    <lucide-icon name="log-out" class="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary-600"></lucide-icon>
                    Se déconnecter
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <!-- Desktop sidebar -->
      <div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col lg:block transition-all duration-300" 
           [class]="sidebarCollapsed ? 'lg:w-16' : 'lg:w-72'">
        
        <!-- Collapse/Expand Button -->
        <button
          (click)="onToggleSidebarCollapse()"
          class="absolute -right-3 top-6 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm hover:bg-gray-50 transition-colors">
          <lucide-icon 
            [name]="sidebarCollapsed ? 'chevron-right' : 'chevron-left'" 
            class="h-4 w-4 text-gray-600">
          </lucide-icon>
        </button>
        
        <div class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white pb-4" 
             [class]="sidebarCollapsed ? 'px-2' : 'px-6'">
          
          <!-- User Profile -->
          <div class="flex h-16 shrink-0 items-center" [class]="sidebarCollapsed ? 'justify-center' : 'gap-x-4'">
            <div [class]="'rounded-full bg-primary-600 flex items-center justify-center transition-all duration-300 ' + (sidebarCollapsed ? 'h-8 w-8' : 'h-10 w-10')">
              <span [class]="'font-medium text-white transition-all duration-300 ' + (sidebarCollapsed ? 'text-xs' : 'text-sm')">{{ userInitials() }}</span>
            </div>
            <div *ngIf="!sidebarCollapsed" class="flex flex-col">
              <span class="text-sm font-semibold text-gray-900">{{ authService.user()?.nomComplet }}</span>
              <span class="text-xs text-gray-500">{{ getRoleDisplayName() }}</span>
              <span *ngIf="entityName()" class="text-xs text-primary-600">{{ entityName() }}</span>
            </div>
          </div>

          <!-- Search -->
          <form *ngIf="!sidebarCollapsed && shouldShowSearch()" class="relative" action="#" method="GET">
            <input
              type="text"
              name="search"
              placeholder="Rechercher..."
              class="w-full rounded-md border-gray-200 py-2 pl-10 pr-4 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <lucide-icon name="search" class="h-5 w-5 text-gray-400"></lucide-icon>
            </div>
          </form>

          <nav class="flex flex-1 flex-col">
            <ul role="list" class="flex flex-1 flex-col gap-y-7">
              <li *ngFor="let section of navigationSections(); let isFirst = first">
                <div *ngIf="section.title && !isFirst && !sidebarCollapsed" class="text-xs font-semibold leading-6 text-gray-400">{{ section.title }}</div>
                <ul role="list" class="-mx-2 space-y-1" [class.mt-2]="section.title && !isFirst">
                  <li *ngFor="let item of section.items" class="relative">
                    <a
                      [routerLink]="item.href"
                      routerLinkActive="bg-gray-50 text-primary-600"
                      [class]="getDesktopNavItemClasses()"
                      [title]="sidebarCollapsed ? item.name : ''">
                      
                      <lucide-icon [name]="item.icon" [class]="getDesktopIconClasses()"></lucide-icon>
                      
                      <span *ngIf="!sidebarCollapsed" class="flex-1">{{ item.name }}</span>
                      
                      <!-- Cart badge -->
                      <span 
                        *ngIf="item.badge === 'cart' && cartItemsCount() > 0"
                        [class]="'inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary-600 rounded-full ' + (sidebarCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto')">
                        {{ cartItemsCount() }}
                      </span>
                    </a>
                  </li>
                </ul>
              </li>
              
              <!-- Logout -->
              <li class="mt-auto">
                <a
                  (click)="handleLogout()"
                  href="#"
                  [class]="'group -mx-2 flex rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-primary-600 ' + (sidebarCollapsed ? 'justify-center' : 'gap-x-3')"
                  [title]="sidebarCollapsed ? 'Se déconnecter' : ''">
                  <lucide-icon name="log-out" class="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary-600"></lucide-icon>
                  <span *ngIf="!sidebarCollapsed">Se déconnecter</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() sidebarOpen = false;
  @Input() sidebarCollapsed = false;
  @Output() closeSidebar = new EventEmitter<void>();
  @Output() toggleSidebarCollapse = new EventEmitter<void>();

  public authService = inject(AuthService);
  private shoppingCartService = inject(ShoppingCartService);
  private router = inject(Router);
  
  // Signals for reactive UI
  public isMobileSidebarOpen = signal(false);
  private navigationStrategy = signal<SidebarNavigationStrategy | null>(null);
  public navigationSections = computed(() => {
    return this.navigationStrategy()?.getNavigation() || [];
  });
  
  public entityName = computed(() => {
    const strategy = this.navigationStrategy();
    const user = this.authService.user();
    return strategy && user ? strategy.getEntityName(user) : null;
  });
  
  public userInitials = computed(() => {
    const user = this.authService.user();
    if (!user?.nomComplet) return '??';
    const parts = user.nomComplet.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return user.nomComplet.substring(0, 2).toUpperCase();
  });
  
  public cartItemsCount = computed(() => {
    return this.shoppingCartService.cartItemsCount();
  });
  
  private routerSubscription?: Subscription;
  private authSubscription?: Subscription;

  ngOnInit(): void {
    // Watch for route navigation to close mobile sidebar
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMobileSidebar();
      });
    
    // Initialize strategy and load shopping cart if needed
    this.updateNavigationStrategy();
    this.loadShoppingCartIfNeeded();
    
    // Watch for auth changes
    this.authSubscription = this.authService.currentUser$.subscribe(() => {
      this.updateNavigationStrategy();
      this.loadShoppingCartIfNeeded();
    });
    
    // Sync mobile sidebar state with input
    this.isMobileSidebarOpen.set(this.sidebarOpen);
  }
  
  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
  }
  
  private updateNavigationStrategy(): void {
    const userRole = this.authService.userRole();
    console.log('Updating navigation strategy for role:', userRole);
    const strategy = SidebarNavigationStrategyFactory.createStrategy(userRole || null);
    const navigation = strategy.getNavigation();
    console.log('Navigation sections:', navigation);
    this.navigationStrategy.set(strategy);
  }
  
  private async loadShoppingCartIfNeeded(): Promise<void> {
    const strategy = this.navigationStrategy();
    const isAuthenticated = this.authService.isAuthenticated();
    
    if (strategy?.shouldLoadShoppingCart() && isAuthenticated) {
      try {
        await this.shoppingCartService.loadActiveCart();
      } catch (error) {
        console.error('Error loading shopping cart in sidebar:', error);
      }
    }
  }
  
  public shouldShowSearch(): boolean {
    return this.navigationStrategy()?.shouldShowSearch() || false;
  }
  
  public closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
    this.closeSidebar.emit();
  }
  
  public onToggleSidebarCollapse(): void {
    this.toggleSidebarCollapse.emit();
  }
  
  public handleLogout(): void {
    this.authService.logout();
    this.closeMobileSidebar();
  }
  
  public getRoleDisplayName(): string {
    const role = this.authService.userRole();
    const roleNames = {
      [UserRole.ADMIN]: 'Admin',
      [UserRole.MANAGER]: 'Manager',
      [UserRole.GESTIONNAIRE]: 'Gestionnaire',
      [UserRole.STATION]: 'Station',
      [UserRole.FOURNISSEUR]: 'Fournisseur'
    };
    return role ? roleNames[role] : '';
  }
  
  public getNavItemClasses(): string {
    return 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:text-primary-600 hover:bg-gray-50';
  }
  
  public getIconClasses(): string {
    return 'h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary-600';
  }
  
  public getDesktopNavItemClasses(): string {
    const baseClasses = 'group flex rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:text-primary-600 hover:bg-gray-50';
    const layoutClasses = this.sidebarCollapsed ? 'justify-center' : 'gap-x-3';
    return `${baseClasses} ${layoutClasses}`;
  }
  
  public getDesktopIconClasses(): string {
    return 'h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary-600';
  }
  
}