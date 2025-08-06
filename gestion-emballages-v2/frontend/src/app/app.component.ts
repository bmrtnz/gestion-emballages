import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { AuthService } from './core/services/auth.service';
import { LoadingService } from './core/services/loading.service';
import { NotificationService } from './core/services/notification.service';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { NotificationComponent } from './shared/components/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LoadingSpinnerComponent,
    NotificationComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Global Loading Spinner -->
      <app-loading-spinner 
        *ngIf="isLoading"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      </app-loading-spinner>

      <!-- Main Application -->
      <router-outlet></router-outlet>

      <!-- Global Notifications -->
      <app-notification></app-notification>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingService = inject(LoadingService);
  public notificationService = inject(NotificationService);

  // Use signal for reactive loading state to avoid expression changed error
  get isLoading() {
    return this.loadingService.isLoading();
  }

  ngOnInit() {
    // Initialize authentication
    this.authService.initializeAuth();

    // Handle route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Scroll to top on route change
        window.scrollTo(0, 0);
      });
  }
}