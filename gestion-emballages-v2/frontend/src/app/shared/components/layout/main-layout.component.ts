import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Sidebar -->
      <app-sidebar
        [sidebarOpen]="sidebarOpen()"
        [sidebarCollapsed]="sidebarCollapsed()"
        (closeSidebar)="closeSidebar()"
        (toggleSidebarCollapse)="toggleSidebarCollapse()">
      </app-sidebar>

      <!-- Main Content -->
      <div class="flex flex-col flex-1 transition-all duration-300"
           [class]="getMainContentClasses()">
        
        <!-- Header -->
        <app-header 
          (menuClick)="toggleSidebar()">
        </app-header>

        <!-- Page Content -->
        <main class="flex-1 overflow-auto">
          <div class="py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <router-outlet></router-outlet>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: []
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
    // Desktop: adjust margin based on sidebar state
    // Mobile: no margin adjustment needed
    const desktopMargin = this.sidebarCollapsed() ? 'lg:ml-16' : 'lg:ml-72';
    return desktopMargin;
  }
}