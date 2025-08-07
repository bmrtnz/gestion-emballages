import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationStart, NavigationEnd } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent
  ],
  template: `
    <div class="min-h-screen relative overflow-hidden bg-gray-50">
      <!-- Animated gradient background -->
      <div class="absolute inset-0 bg-gradient-to-br from-gray-50 via-primary-50/30 to-accent-50/20 pointer-events-none"></div>
      <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-sunshine-50/10 to-energy-50/10 pointer-events-none"></div>
      
      <!-- Content wrapper -->
      <div class="relative z-10">
        <!-- Sidebar -->
        <app-sidebar
          [sidebarOpen]="sidebarOpen()"
          [sidebarCollapsed]="sidebarCollapsed()"
          (closeSidebar)="closeSidebar()"
          (toggleSidebarCollapse)="toggleSidebarCollapse()">
        </app-sidebar>

        <!-- Mobile header -->
        <div class="sticky top-0 z-40 flex items-center gap-x-6 bg-white/95 backdrop-blur-sm px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button
            type="button"
            class="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            (click)="toggleSidebar()">
            <span class="sr-only">Ouvrir le menu</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div class="flex-1 text-sm font-semibold leading-6 text-gray-900">
            Gestion Emballages
          </div>
        </div>

        <!-- Main Content -->
        <div class="min-h-screen" [class]="getMainContentClasses()">
          <main class="py-10 min-h-screen bg-gray-50">
            <div class="px-4 sm:px-6 lg:px-8">
              <router-outlet></router-outlet>
            </div>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f9fafb;
    }
  `]
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  
  public sidebarOpen = signal(false); // Start with mobile sidebar closed
  public sidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  toggleSidebarCollapse(): void {
    this.sidebarCollapsed.update(collapsed => !collapsed);
  }

  getMainContentClasses(): string {
    // Desktop: adjust padding-left based on sidebar state (matching Vue.js)
    // Mobile: no padding adjustment needed
    const desktopPadding = this.sidebarCollapsed() ? 'lg:pl-16' : 'lg:pl-72';
    return desktopPadding;
  }
}